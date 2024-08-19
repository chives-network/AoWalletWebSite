-- Name: ChivesSwap
-- Author: Chives-Network
-- Email: chivescoin@gmail.com
-- Copyright: MIT
-- Version: 20240819
-- Github: https://github.com/chives-network/AoWalletWebsite/blob/main/blueprints/chivesswap.lua

-- Function
-- 1. Add Token pair
-- 2. Add Liquidity
-- 3. Remove Liquidity
-- 4. Liquidity Mining
-- 5. Swap
-- 6. Get Txs


local function _loaded_mod_txs()
    local module = {}

    local maxTxsCount = 1000

    -- txid -> index
    local txOrder = {} 
    local txRecord = {}

    local function getTx(txid)
        return txRecord[txid]
    end
    module.getTx = getTx

    local function insertTx(txid, tx)
        if #txOrder >= maxTxsCount then
            local txid = table.remove(txOrder, 1)
            txRecord[txid] = nil
        end
        table.insert(txOrder, txid)
        txRecord[txid] = tx
        return true
    end
    module.insertTx = insertTx

    local function getTxs()
        local txs = {}
        for i, txid in ipairs(txOrder) do
            print(i, txid)
            table.insert(txs, txRecord[txid])
        end
        return txs
    end
    module.getTxs = getTxs

    return module
end

_G.package.loaded[".txs"] = _loaded_mod_txs()

local ao = require('ao')
local json = require('json')

local bint = require('.bint')(1024)
local txs = require('.txs')

Variant = '20240819'

function Welcome()
    return(
        "Welcome to Chives Swap V20240819!\n\n" ..
        "Main functoin:\n\n" ..
        "1. Add Token pair.\n" ..
        "2. Add Liquidity.\n" ..
        "3. Remove Liquidity.\n" ..
        "4. Liquidity Mining.\n" ..
        "5. Swap.\n" ..
        "6. Get Txs.\n" ..
        "Have fun, be respectful !")
end

-- Pool Config
Pool = {
    X = 'oz3s7ImYeqXs1Hw-wkZenUp67ild8SzVZc6apVt_ZnU',
    SymbolX = 'PX',
    DecimalX = '12',
    Y = 'fxgm-Vl5CeXUj1_bMgLw1eiUTDkHY_bjrgw0H9DGmW0',
    SymbolY = 'PY',
    DecimalY = '6',
    Fee = '100'
}

BalancesX = BalancesX or {}
BalancesY = BalancesY or {}
Px = Px or '0'
Py = Py or '0'

-- LP Token Info
Name = Pool.SymbolX .. '-' .. Pool.SymbolY .. '-' .. Pool.Fee
Ticker = Name
Denomination = Pool.DecimalX

Balances = Balances or {}
TotalSupply = TotalSupply or '0'

-- Liquidity Mining
Mining = Mining or {}

local utils = {
    add = function (a, b) 
        return tostring(bint(a) + bint(b))
    end,
    subtract = function (a, b)
        return tostring(bint(a) - bint(b))
    end,
    toBalanceValue = function (a)
        return tostring(bint(a))
    end,
    toNumber = function (a)
        return tonumber(a)
    end
}

local function getInputPrice(amountIn, reserveIn, reserveOut, Fee)
    local amountInWithFee = bint.__mul(amountIn, bint.__sub(10000, Fee))
    local numerator = bint.__mul(amountInWithFee, reserveOut)
    local denominator = bint.__add(bint.__mul(10000, reserveIn), amountInWithFee)
    return bint.udiv(numerator, denominator)
end

function NotTrusted(msg)
    local mu = "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY"
    -- return false if trusted
    if msg.Owner == mu then
        return false
    end
    if msg.From == msg.Owner then
        return false
    end
    return true
end

function isAssignment(msg)
    return msg.Target ~= ao.id
end

function isAssignable(msg)
    return false
end

Handlers.prepend("verifyMsgTrust", 
    NotTrusted,
    function (msg)
        print("Msg not trusted")
    end
)

Handlers.prepend("sec-patch-8-18-2024", 
    function (msg)
        return isAssignment(msg) and not isAssignable(msg)
    end, 
    function (msg) 
        Send({Target = msg.From, Data = "Assignment is not trusted by this process!"})
        print('Assignment is not trusted! From: ' .. msg.From .. ' - Owner: ' .. msg.Owner)
    end
)

Handlers.add('info', Handlers.utils.hasMatchingTag('Action', 'Info'), 
    function(msg)
        ao.send({
            Target = msg.From,
            X = Pool.X,
            SymbolX = Pool.SymbolX,
            DecimalX = Pool.DecimalX,
            Y = Pool.Y,
            SymbolY = Pool.SymbolY,
            DecimalY = Pool.DecimalY,
            Fee = Pool.Fee,
            PX = Px,
            PY = Py,
            Name = Name,
            Ticker = Ticker,
            Denomination = tostring(Denomination),
            TotalSupply = TotalSupply,
        })
    end
)

Handlers.add('balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), 
    function(msg)
        local user = msg.From
        if msg.Tags.Recipient then
            user = msg.Tags.Recipient
        end
        if msg.Tags.Target then
            user = msg.Tags.Target
        end
        if msg.Account then
            user = msg.Account
        end

        local bx = '0'
        local by = '0'
        local bal = '0'
        if BalancesX[user] then bx = BalancesX[user] end
        if BalancesY[user] then by = BalancesY[user] end
        if Balances[user] then bal = Balances[user] end
            
        ao.send({
            Target = msg.From,
            BalanceX = bx,
            BalanceY = by,
            Ticker = Ticker,
            Balance = bal,
            Account = user,
            TotalSupply = TotalSupply,
            Data = bal
        })
    end
)

Handlers.add('deposit', 
    function(msg) 
        return (msg.Action == 'Credit-Notice') and (msg['X-Chives-For'] ~= 'Swap') 
    end, 
    function(msg)
        assert(type(msg.Sender) == 'string', 'Sender is required')
        assert(type(msg.Quantity) == 'string', 'Quantity is required')
        assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than 0')

        local qty = bint(msg.Quantity)    
        if msg.From == Pool.X then
            if not BalancesX[msg.Sender] then BalancesX[msg.Sender] = '0' end
            BalancesX[msg.Sender] = tostring(bint.__add(bint(BalancesX[msg.Sender]), qty))
            ao.send({
                Target = msg.Sender,
                Data = 'Deposited ' .. msg.Quantity ..  ' X token'
            })
        elseif msg.From == Pool.Y then
            if not BalancesY[msg.Sender] then BalancesY[msg.Sender] = '0' end
            BalancesY[msg.Sender] = tostring(bint.__add(bint(BalancesY[msg.Sender]), qty))
            ao.send({
                Target = msg.Sender,
                Data = 'Deposited ' .. msg.Quantity ..  ' Y token'
            })
        else
            -- todo: refund
            ao.send({
                Target = msg.Sender,
                Error = 'ERROR_INVALID_DEPOSIT_TOKEN'
            })
        end
    end
)

Handlers.add('withdraw', Handlers.utils.hasMatchingTag('Action', 'Withdraw'), 
    function(msg)
        if (not BalancesX[msg.From] or bint.__eq(bint(0), bint(BalancesX[msg.From]))) 
            and (not BalancesY[msg.From] or bint.__eq(bint(0), bint(BalancesY[msg.From]))) then
            ao.send({
                Target = msg.Sender,
                Error = 'ERROR_INSUFFICIENT_BALANCE'
            })
            return
        end

        if BalancesX[msg.From] and bint.__lt(0, bint(BalancesX[msg.From])) then
            local qty = BalancesX[msg.From]
            BalancesX[msg.From] = '0'
            ao.send({
                Target = Pool.X, 
                Action = 'Transfer', 
                Recipient = msg.From, 
                Quantity = qty, 
                ['X-Chives-Reason'] = 'Withdraw'
            })
            ao.send({
                Target = msg.Sender,
                Data = 'Withdrawed ' .. qty ..  ' X token'
            })

        end

        if BalancesY[msg.From] and bint.__lt(0, bint(BalancesY[msg.From])) then
            local qty = BalancesY[msg.From]
            BalancesY[msg.From] = '0'
            ao.send({ 
                Target = Pool.Y, 
                Action = 'Transfer', 
                Recipient = msg.From, 
                Quantity = qty, 
                ['X-Chives-Reason'] = 'Withdraw'
            })
            ao.send({
                Target = msg.Sender,
                Data = 'Withdrawed ' .. qty ..  ' Y token'
            })
        end
    end
)

local function validateSwapMsg(msg) 
    if not bint.__lt(0, bint(TotalSupply)) then
        return false, 'ERROR_POOL_NO_LIQUIDITY'
    end

    if msg.From ~= Pool.X and msg.From ~= Pool.Y then
        return false, 'ERROR_INVALID_TOKEN_IN'
    end

    if not msg['X-Chives-MinAmountOut'] then
        return false, 'ERROR_INVALID_MIN_AMOUNT_OUT'
    end

    local ok, minAmountOut = pcall(bint, msg['X-Chives-MinAmountOut'])
    if not ok then
        return false, 'ERROR_INVALID_MIN_AMOUNT_OUT'
    end

    if not bint.__lt(0, minAmountOut) then
        return false, 'ERROR_INVALID_MIN_AMOUNT_OUT'
    end
    return true, nil
end

Handlers.add('swap', 
    function(msg) 
        return (msg.Action == 'Credit-Notice') and (msg['X-Chives-For'] == 'Swap') 
    end, 
    function(msg)
        assert(type(msg.Sender) == 'string', 'Sender is required')
        assert(type(msg.Quantity) == 'string', 'Quantity is required')
        assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than 0')
        ok, err = validateSwapMsg(msg)
        if not ok then
            ao.send({ 
                Target = msg.From, 
                Action = 'Transfer', 
                Recipient = msg.Sender, 
                Quantity = msg.Quantity, 
                ['X-Chives-OrderId'] = msg['Pushed-For'], 
                ['X-Chives-TxIn'] = msg.Id, 
                ['X-Chives-TokenIn'] = msg.From, 
                ['X-Chives-AmountIn'] = msg.Quantity, 
                ['X-Chives-Status'] = 'Refund', 
                ['X-Chives-Error'] = err
            })
            return
        end

        local user = msg.Sender
        local amountIn = bint(msg.Quantity)
        local tokenIn = msg.From
        local minAmountOut = bint(msg['X-Chives-MinAmountOut'])
        if tokenIn == Pool.X then
            local reserveIn = bint(Px)
            local reserveOut = bint(Py)
            local amountOut = getInputPrice(amountIn, reserveIn, reserveOut, bint(Pool.Fee))
            if bint.__lt(minAmountOut, amountOut) or bint.__eq(minAmountOut, amountOut) then
                Px = tostring(bint.__add(amountIn, reserveIn))
                Py = tostring(bint.__sub(reserveOut, amountOut))
                ao.send({ 
                    Target = Pool.Y, 
                    Action = 'Transfer', 
                    Recipient = user, 
                    Quantity = tostring(amountOut), 
                    ['X-Chives-OrderId'] = msg['Pushed-For'], 
                    ['X-Chives-TxIn'] = msg.Id, 
                    ['X-Chives-TokenIn'] = msg.From, 
                    ['X-Chives-AmountIn'] = msg.Quantity, 
                    ['X-Chives-Status'] = 'Swapped'
                })
                return
            else
                -- Refund
                ao.send({ 
                    Target = msg.From, 
                    Action = 'Transfer', 
                    Recipient = user, 
                    Quantity = msg.Quantity, 
                    ['X-Chives-OrderId'] = msg['Pushed-For'], 
                    ['X-Chives-TxIn'] = msg.Id, 
                    ['X-Chives-TokenIn'] = msg.From, 
                    ['X-Chives-AmountIn'] = msg.Quantity, 
                    ['X-Chives-Status'] = 'Refund',
                    ['X-Chives-Error'] = 'ERROR_AMOUNT_OUT_TOO_SMALL'
                })
                return
            end
        end

        if tokenIn == Pool.Y then
            local reserveIn = bint(Py)
            local reserveOut = bint(Px)
            local amountOut = getInputPrice(amountIn, reserveIn, reserveOut, bint(Pool.Fee))
            if bint.__lt(minAmountOut, amountOut) or bint.__eq(minAmountOut, amountOut) then
                Px = tostring(bint.__sub(reserveOut, amountOut))
                Py = tostring(bint.__add(amountIn, reserveIn))
                ao.send({ 
                    Target = Pool.X, 
                    Action = 'Transfer', 
                    Recipient = user, 
                    Quantity = tostring(amountOut), 
                    ['X-Chives-OrderId'] = msg['Pushed-For'], 
                    ['X-Chives-TxIn'] = msg.Id, 
                    ['X-Chives-TokenIn'] = msg.From, 
                    ['X-Chives-AmountIn'] = msg.Quantity, 
                    ['X-Chives-Status'] = 'Swapped'
                })
                return
            else
                -- Refund
                ao.send({ 
                    Target = msg.From, 
                    Action = 'Transfer', 
                    Recipient = user, 
                    Quantity = msg.Quantity, 
                    ['X-Chives-OrderId'] = msg['Pushed-For'], 
                    ['X-Chives-TxIn'] = msg.Id, 
                    ['X-Chives-TokenIn'] = msg.From, 
                    ['X-Chives-AmountIn'] = msg.Quantity, 
                    ['X-Chives-Status'] = 'Refund', 
                    ['X-Chives-Error'] = 'ERROR_AMOUNT_OUT_TOO_SMALL'
                })
                return
            end
        end
    end
)

Handlers.add('gotDebitNotice', Handlers.utils.hasMatchingTag('Action', 'Debit-Notice'), 
    function(msg)
        if not msg['X-Chives-OrderId'] then
            return
        end

        local user = msg.Recipient
        local tokenOut = msg.From
        local tokenIn = msg['X-Chives-TokenIn']
        local amountIn = msg['X-Chives-AmountIn']
        local amountOut = msg.Quantity
        local err = msg['X-Chives-Error'] or ''

        local order = {
            User = user,
            OrderId = msg['X-Chives-OrderId'],
            Pool = Name,
            PoolId = ao.id,
            TxIn = msg['X-Chives-TxIn'],
            TxOut = msg.Id,
            TokenOut = tokenOut,
            TokenIn = tokenIn,
            AmountIn = amountIn,
            AmountOut = amountOut,
            OrderStatus = msg['X-Chives-Status'],
            Error = err,
            TimeStamp = tostring(msg.Timestamp)
        }
        
        -- 重复订单将覆盖之前的订单
        txs.insertTx(msg['X-Chives-OrderId'], order) 

        ao.send({ 
            Target = ao.id, 
            Action = 'Order-Notice', 
            User = user, 
            OrderId = msg['X-Chives-OrderId'], 
            Pool = Name,
            PoolId = ao.id,
            TxIn = msg['X-Chives-TxIn'], 
            TxOut = msg.Id,
            TokenOut = tokenOut, 
            TokenIn = tokenIn, 
            AmountIn = amountIn, 
            AmountOut = amountOut,
            OrderStatus = msg['X-Chives-Status'], 
            Error = err,
            TimeStamp = tostring(msg.Timestamp)
        })
    end
)

Handlers.add('getOrder', Handlers.utils.hasMatchingTag('Action', 'GetOrder'), 
    function(msg)
        assert(type(msg.OrderId) == 'string', 'OrderId is required')
        local order = txs.getTx(msg.OrderId) or ''
        ao.send({ 
            Target = msg.From, 
            Data = json.encode(order)
        })
    end
)

Handlers.add('addLiquidity', Handlers.utils.hasMatchingTag('Action', 'AddLiquidity'), 
    function(msg)
        assert(type(msg.MinLiquidity) == 'string', 'MinLiquidity is required')
        assert(bint.__lt(0, bint(msg.MinLiquidity)), 'MinLiquidity must be greater than 0')

        -- init liquidity
        if bint.__eq(bint('0'), bint(TotalSupply)) and 
            BalancesX[msg.From] and bint.__lt(0, bint(BalancesX[msg.From])) and 
            BalancesY[msg.From] and bint.__lt(0, bint(BalancesY[msg.From])) 
        then
            Px = BalancesX[msg.From]
            Py = BalancesY[msg.From]
            BalancesX[msg.From] = '0'
            BalancesY[msg.From] = '0'
            Balances[msg.From] = Px
            TotalSupply = Px
            local notice = 
            ao.send({
                Target = msg.From,
                TimeStamp = tostring(msg.Timestamp),
                Action = "LiquidityAdded-Notice",
                User = msg.From,
                Result = 'ok',
                Pool = Name,
                PoolId = ao.id,
                AddLiquidityTx = msg.Id,
                X = Pool.X,
                Y = Pool.Y,
                AmountX = Px,
                AmountY = Py,
                RefundX = '0',
                RefundY = '0',
                AmountLp = Px,
                BalanceLp = Balances[msg.From],
                TotalSupply = TotalSupply,
                Data = 'Liquidity added',
            })

            for i, pid in ipairs(Mining) do
                ao.send({
                    Target = pid,
                    TimeStamp = tostring(msg.Timestamp),
                    Action = "LiquidityAdded-Notice",
                    User = msg.From,
                    Result = 'ok',
                    Pool = Name,
                    PoolId = ao.id,
                    AddLiquidityTx = msg.Id,
                    X = Pool.X,
                    Y = Pool.Y,
                    AmountX = Px,
                    AmountY = Py,
                    RefundX = '0',
                    RefundY = '0',
                    AmountLp = Px,
                    BalanceLp = Balances[msg.From],
                    TotalSupply = TotalSupply,
                    Data = 'Liquidity added',
                })
            end

            return
        end

        local liquidityMinted = 0

        if bint.__lt(0, bint(TotalSupply)) and 
            BalancesX[msg.From] and bint.__lt(0, bint(BalancesX[msg.From])) and 
            BalancesY[msg.From] and bint.__lt(0, bint(BalancesY[msg.From])) 
        then
            local totalLiquidity = bint(TotalSupply)
            local reserveX = bint(Px)
            local reserveY = bint(Py)
            local amountX = bint(BalancesX[msg.From])
            local amountY = bint.udiv(bint.__mul(amountX, reserveY), reserveX) -- + 1
            liquidityMinted = bint.udiv(bint.__mul(amountX, totalLiquidity), reserveX) 

            ao.send({
                Target = msg.From,
                totalLiquidity = tostring(totalLiquidity),
                reserveX = tostring(reserveX),
                reserveY = tostring(reserveY),
                amountX = tostring(amountX),
                amountY = tostring(amountY),
                BalancesX = BalancesX,
                BalancesY = BalancesY,
                liquidityMinted = tostring(liquidityMinted),
                falseLiquidityMintedMinLiquidity = (not bint.__lt(liquidityMinted, bint(msg.MinLiquidity))),
                falseBalancesYAmountY = (not bint.__lt(bint(BalancesY[msg.From]), amountY))
            })

            if (not bint.__lt(liquidityMinted, bint(msg.MinLiquidity))) and (not bint.__lt(bint(BalancesY[msg.From]), amountY)) then
                Px = tostring(bint.__add(reserveX, amountX))
                Py = tostring(bint.__add(reserveY, amountY))
                BalancesX[msg.From] = '0'
                
                local refundY = tostring(bint.__sub(bint(BalancesY[msg.From]), amountY))
                BalancesY[msg.From] = '0'
                
                TotalSupply = tostring(bint.__add(totalLiquidity, liquidityMinted))
                if not Balances[msg.From] then Balances[msg.From] = '0' end
                Balances[msg.From] = tostring(bint.__add(bint(Balances[msg.From]), liquidityMinted))

                -- Refund Token Y
                if bint.__lt(0, bint(refundY)) then
                    ao.send({ 
                        Target = Pool.Y, 
                        Action = 'Transfer', 
                        Recipient = msg.From, 
                        Quantity = refundY, 
                        ['X-Chives-AddLiquidity-Refund-Id'] = msg.Id,
                        ['X-Chives-Reason'] = 'AddLiquidity-Excess-Refund'
                    })
                end
                ao.send({
                    Target = msg.From,
                    TimeStamp = tostring(msg.Timestamp),
                    Action = "LiquidityAdded-Notice",
                    User = msg.From,
                    Result = 'ok',
                    Pool = Name,
                    PoolId = ao.id,
                    AddLiquidityTx = msg.Id,
                    X = Pool.X,
                    Y = Pool.Y,
                    AmountX = tostring(amountX),
                    AmountY = tostring(amountY),
                    RefundX = '0',
                    RefundY = refundY,
                    AmountLp = tostring(liquidityMinted),
                    BalanceLp = Balances[msg.From],
                    TotalSupply = TotalSupply,
                    Data = 'Liquidity added',
                })
                
                for i, pid in ipairs(Mining) do
                    ao.send({
                        Target = pid,
                        TimeStamp = tostring(msg.Timestamp),
                        Action = "LiquidityAdded-Notice",
                        User = msg.From,
                        Result = 'ok',
                        Pool = Name,
                        PoolId = ao.id,
                        AddLiquidityTx = msg.Id,
                        X = Pool.X,
                        Y = Pool.Y,
                        AmountX = tostring(amountX),
                        AmountY = tostring(amountY),
                        RefundX = '0',
                        RefundY = refundY,
                        AmountLp = tostring(liquidityMinted),
                        BalanceLp = Balances[msg.From],
                        TotalSupply = TotalSupply,
                        Data = 'Liquidity added',
                    })
                end

                return
            end

            -- 使用 amount Y
            amountY = bint(BalancesY[msg.From])
            amountX = bint.udiv(bint.__mul(amountY, reserveX), reserveY) -- + 1
            liquidityMinted = bint.udiv(bint.__mul(amountX, totalLiquidity), reserveX)
            if (not bint.__lt(liquidityMinted, bint(msg.MinLiquidity))) and (not bint.__lt(bint(BalancesX[msg.From]), amountX)) then
                Px = tostring(bint.__add(reserveX, amountX))
                Py = tostring(bint.__add(reserveY, amountY))
                BalancesY[msg.From] = '0'
                
                local refundX = tostring(bint.__sub(bint(BalancesX[msg.From]), amountX))
                BalancesX[msg.From] = '0'
                
                TotalSupply = tostring(bint.__add(totalLiquidity, liquidityMinted))
                if not Balances[msg.From] then Balances[msg.From] = '0' end
                Balances[msg.From] = tostring(bint.__add(bint(Balances[msg.From]), liquidityMinted))

                -- Refund Token X
                if bint.__lt(0, bint(refundX)) then
                    ao.send({ 
                        Target = Pool.X, 
                        Action = 'Transfer', 
                        Recipient = msg.From, 
                        Quantity = refundX, 
                        ['X-Chives-AddLiquidity-Refund-Id'] = msg.Id,
                        ['X-Chives-Reason'] = 'AddLiquidity-Excess-Refund'
                    })
                end
                ao.send({
                    Target = msg.From,
                    TimeStamp = tostring(msg.Timestamp),
                    Action = "LiquidityAdded-Notice",
                    User = msg.From,
                    Result = 'ok',
                    Pool = Name,
                    PoolId = ao.id,
                    AddLiquidityTx = msg.Id,
                    X = Pool.X,
                    Y = Pool.Y,
                    AmountX = tostring(amountX),
                    AmountY = tostring(amountY),
                    RefundX = refundX,
                    RefundY = '0',
                    AmountLp = tostring(liquidityMinted),
                    BalanceLp = Balances[msg.From],
                    TotalSupply = TotalSupply,
                    Data = 'Liquidity added',
                })
                for i, pid in ipairs(Mining) do
                    ao.send({
                        Target = pid,
                        TimeStamp = tostring(msg.Timestamp),
                        Action = "LiquidityAdded-Notice",
                        User = msg.From,
                        Result = 'ok',
                        Pool = Name,
                        PoolId = ao.id,
                        AddLiquidityTx = msg.Id,
                        X = Pool.X,
                        Y = Pool.Y,
                        AmountX = tostring(amountX),
                        AmountY = tostring(amountY),
                        RefundX = refundX,
                        RefundY = '0',
                        AmountLp = tostring(liquidityMinted),
                        BalanceLp = Balances[msg.From],
                        TotalSupply = TotalSupply,
                        Data = 'Liquidity added',
                    })
                end
                return
            end
            
            ao.send({
                Target = msg.From,
                totalLiquidity = tostring(totalLiquidity),
                reserveX = tostring(reserveX),
                reserveY = tostring(reserveY),
                amountX = tostring(amountX),
                amountY = tostring(amountY),
                BalancesX = BalancesX,
                BalancesY = BalancesY,
                liquidityMinted = tostring(liquidityMinted),
                falseLiquidityMintedMinLiquidity = (not bint.__lt(liquidityMinted, bint(msg.MinLiquidity))),
                falseBalancesXAmountX = (not bint.__lt(bint(BalancesX[msg.From]), amountX)),
            })

        end

        local refundX = '0'
        local refundY = '0'
        if BalancesX[msg.From] and bint.__lt(0, bint(BalancesX[msg.From])) then
            refundX = BalancesX[msg.From]
            BalancesX[msg.From] = '0'
            ao.send({
                Target = Pool.X, 
                Action = 'Transfer', 
                Recipient = msg.From, 
                Quantity = refundX, 
                ['X-Chives-Reason'] = 'AddLiquidity-Refund',
                ['X-Chives-AddLiquidity-Refund-Id'] = msg.Id,
            })
        end

        if BalancesY[msg.From] and bint.__lt(0, bint(BalancesY[msg.From])) then
            refundY = BalancesY[msg.From]
            BalancesY[msg.From] = '0'
            ao.send({ 
                Target = Pool.Y, 
                Action = 'Transfer', 
                Recipient = msg.From, 
                Quantity = refundY, 
                ['X-Chives-Reason'] = 'AddLiquidity-Refund',
                ['X-Chives-AddLiquidity-Refund-Id'] = msg.Id,
            })
        end

        local bp = Balances[msg.From] or '0'
        ao.send({
            Target = msg.From,
            TimeStamp = tostring(msg.Timestamp),
            User = msg.From,
            Action = "LiquidityAddFailed-Notice",
            Pool = Name,
            PoolId = ao.id,
            X = Pool.X,
            Y = Pool.Y,
            AddLiquidityTx = msg.Id,
            Result = 'Refund',
            AmountX = '0',
            AmountY = '0',
            RefundX = refundX,
            RefundY = refundY,
            AmountLp = '0',
            BalanceLp = bp,
            TotalSupply = TotalSupply,
            Data = 'Liquidity not added',
            liquidityMinted = tostring(liquidityMinted),
            MinLiquidity = msg.MinLiquidity
        })
    end
)

Handlers.add('removeLiquidity', Handlers.utils.hasMatchingTag('Action', 'RemoveLiquidity'), 
    function(msg)
        assert(bint.__lt(0, bint(TotalSupply), 'Pool no liquidity'))
        assert(type(msg.Quantity) == 'string', 'Quantity is required')
        assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than 0')
        assert(type(msg.MinX) == 'string', 'MinX is required')
        assert(bint.__lt(0, bint(msg.MinX)), 'MinX must be greater than 0')
        assert(type(msg.MinY) == 'string', 'MinY is required')
        assert(bint.__lt(0, bint(msg.MinY)), 'MinY must be greater than 0')

        local qty = bint(msg.Quantity)
        local minX = bint(msg.MinX)
        local minY = bint(msg.MinY)
        if Balances[msg.From] and (bint.__lt(qty, bint(Balances[msg.From])) or (bint.__eq(qty, bint(Balances[msg.From])))) then
            local totalLiquidity = bint(TotalSupply)
            local reserveX = bint(Px)
            local reserveY = bint(Py)
            local amountX = bint.udiv(bint.__mul(qty, reserveX), totalLiquidity) 
            local amountY = bint.udiv(bint.__mul(qty, reserveY), totalLiquidity)
            if bint.__lt(amountX, minX) or bint.__lt(amountY, minY) then
                ao.send({
                    Target = msg.From,
                    TimeStamp = tostring(msg.Timestamp),
                    User = msg.From,
                    Action = "LiquidityRemoveFailed-Notice",
                    Pool = Name,
                    PoolId = ao.id,
                    X = Pool.X,
                    Y = Pool.Y,
                    MinX = msg.MinX,
                    MinY = msg.MinY,
                    RemoveLiquidityTx = msg.Id,
                    Data = 'Liquidity not removed',
                    Error = 'ERROR_AMOUNT_OUTPUT_TOO_SMALL'
                })
                return
            end
            TotalSupply = tostring(bint.__sub(totalLiquidity , qty))
            Px = tostring(bint.__sub(reserveX, amountX))
            Py = tostring(bint.__sub(reserveY, amountY))
            Balances[msg.From] = tostring(bint.__sub(bint(Balances[msg.From]), qty))
            ao.send({ 
                Target = Pool.X, 
                Action = 'Transfer', 
                Recipient = msg.From,
                Quantity = tostring(amountX),
                ['X-Chives-RemoveLiquidity-Id'] = msg.Id, 
                ['X-Chives-Reason'] = 'RemoveLiquidity'
            })
            ao.send({ 
                Target = Pool.Y, 
                Action = 'Transfer', 
                Recipient = msg.From, 
                Quantity = tostring(amountY), 
                ['X-Chives-RemoveLiquidity-Id'] = msg.Id,
                ['X-Chives-Reason'] = 'RemoveLiquidity'
            })
            ao.send({
                Target = msg.From,
                TimeStamp = tostring(msg.Timestamp),
                Action = "LiquidityRemoved-Notice",
                User = msg.From,
                Result = 'ok',
                Pool = Name,
                PoolId = ao.id,
                RemoveLiquidityTx = msg.Id,
                X = Pool.X,
                Y = Pool.Y,
                AmountX = tostring(amountX),
                AmountY = tostring(amountY),
                AmountLp = msg.Quantity,
                BalanceLp = Balances[msg.From],
                TotalSupply = TotalSupply,
                Data = 'Liquidity removed',
            })

            for i, pid in ipairs(Mining) do
                ao.send({
                    Target = pid,
                    TimeStamp = tostring(msg.Timestamp),
                    Action = "LiquidityRemoved-Notice",
                    User = msg.From,
                    Result = 'ok',
                    Pool = Name,
                    PoolId = ao.id,
                    RemoveLiquidityTx = msg.Id,
                    X = Pool.X,
                    Y = Pool.Y,
                    AmountX = tostring(amountX),
                    AmountY = tostring(amountY),
                    AmountLp = msg.Quantity,
                    BalanceLp = Balances[msg.From],
                    TotalSupply = TotalSupply,
                    Data = 'Liquidity removed'
                })
            end
            
        else
            ao.send({
                Target = msg.From,
                TimeStamp = tostring(msg.Timestamp),
                User = msg.From,
                Action = "LiquidityRemoveFailed-Notice",
                Pool = Name,
                PoolId = ao.id,
                X = Pool.X,
                Y = Pool.Y,
                MinX = msg.MinX,
                MinY = msg.MinY,
                RemoveLiquidityTx = msg.Id,
                Data = 'Liquidity not removed',
                Error = 'ERROR_INSUFFICIENT_BALANCE'
            })
        end
    end
)

Handlers.add('balances', Handlers.utils.hasMatchingTag('Action', 'Balances'),
    function(msg) 
        local bs = {
            BalancesX = BalancesX,
            BalancesY = BalancesY,
            Ticker = Ticker,
            Balances = Balances,
            TotalSupply = TotalSupply,
        }
        ao.send({ 
            Target = msg.From, 
            Data = json.encode(bs) 
        }) 
    end
)

Handlers.add('transfer', Handlers.utils.hasMatchingTag('Action', 'Transfer'), 
    function(msg)
        assert(type(msg.Recipient) == 'string', 'Recipient is required!')
        assert(type(msg.Quantity) == 'string', 'Quantity is required!')
        assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than 0')

        if not Balances[msg.From] then Balances[msg.From] = '0' end
        if not Balances[msg.Recipient] then Balances[msg.Recipient] = '0' end

        if bint(msg.Quantity) <= bint(Balances[msg.From]) then
            Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
            Balances[msg.Recipient] = utils.add(Balances[msg.Recipient], msg.Quantity)

            --[[
                Only send the notifications to the Sender and Recipient
                if the Cast tag is not set on the Transfer message
            ]]
            --
            if not msg.Cast then
                -- Debit-Notice message template, that is sent to the Sender of the transfer
                local debitNotice = {
                    Target = msg.From,
                    Action = 'Debit-Notice',
                    Recipient = msg.Recipient,
                    Quantity = msg.Quantity,
                    Data = Colors.gray ..
                        'You transferred ' ..
                        Colors.blue .. msg.Quantity .. Colors.gray .. ' to ' .. Colors.green .. msg.Recipient .. Colors.reset
                }
                -- Credit-Notice message template, that is sent to the Recipient of the transfer
                local creditNotice = {
                    Target = msg.Recipient,
                    Action = 'Credit-Notice',
                    Sender = msg.From,
                    Quantity = msg.Quantity,
                    Data = Colors.gray ..
                        'You received ' ..
                        Colors.blue .. msg.Quantity .. Colors.gray .. ' from ' .. Colors.green .. msg.From .. Colors.reset
                }

                -- Add forwarded tags to the credit and debit notice messages
                for tagName, tagValue in pairs(msg) do
                    -- Tags beginning with 'X-' are forwarded
                    if string.sub(tagName, 1, 2) == 'X-' then
                        debitNotice[tagName] = tagValue
                        creditNotice[tagName] = tagValue
                    end
                end

                -- Send Debit-Notice and Credit-Notice
                ao.send(debitNotice)
                ao.send(creditNotice)

                -- Send Transfer-Notice
                for i, pid in ipairs(Mining) do
                    ao.send({
                        Target = pid,
                        Action = "Transfer-Notice",
                        Sender = msg.From,
                        Recipient = msg.Recipient,
                        Quantity = msg.Quantity,
                        SenderBalance = Balances[msg.From],
                        RecipientBalance = Balances[msg.Recipient],
                        Data = 'Liquidity transfered',
                    })
                end
            end
        else
            ao.send({
                Target = msg.From,
                Action = 'Transfer-Error',
                ['Message-Id'] = msg.Id,
                Error = 'Insufficient Balance!'
            })
        end
    end
)

Handlers.add('totalSupply', Handlers.utils.hasMatchingTag('Action', 'Total-Supply'), 
    function(msg)
        assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')
        ao.send({
            Target = msg.From,
            Action = 'Total-Supply',
            Data = TotalSupply,
            Ticker = Ticker
        })
    end
)

Handlers.add('registerMining', Handlers.utils.hasMatchingTag('Action', 'RegisterMining'), 
    function(msg)
        local exists = false
        for i, pid in ipairs(Mining) do
            if pid == msg.From then
                exists = true
                break
            end
        end

        if not exists then
            table.insert(Mining, msg.From)
            ao.send({ 
                Target = msg.From, 
                Action = 'RegisteredMining',
                Data = json.encode(Balances) 
            })
        else
            ao.send({ 
                Target = msg.From, 
                Error = 'ERROR_MINING_PID_EXISTS'
            })
        end
    end
)

Handlers.add('unregisterMining', Handlers.utils.hasMatchingTag('Action', 'UnregisterMining'), 
    function(msg)
        for i, pid in ipairs(Mining) do
            if pid == msg.From then
                table.remove(Mining, i)    
                break
            end
        end
        ao.send({ 
            Target = msg.From, 
            Action = 'UnregisteredMining',
        })
    end
)


return Welcome()