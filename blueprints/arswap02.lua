

-- module: "utils"
local function _loaded_mod_utils()
    local bint = require('.bint')(256);
    
    ---@param n Bint
    ---@return Bint
    local function bintSqrt(n)
        if (n <= bint.zero()) then
            return bint.zero();
        end;
    
        local two = bint(2);
        local cur = n;
        local div = n // two;
        local prev = cur;
    
        -- Newton-Raphson Iteration
        while (div < cur) do
            cur = (div + cur) // two;
            if (cur == prev) then
                break;
            end;
            div = n // cur;
            prev = cur;
        end;
    
        return cur;
    end;
    
    ---@param tokenAddress string
    ---@return boolean
    local function checkTokenAddress(tokenAddress)
        return (tokenAddress == Constants.TOKEN_A.Address or tokenAddress == Constants.TOKEN_B.Address);
    end;
    
    ---@param tokenAddress string
    ---@return nil
    local function assertTokenAddress(tokenAddress)
        assert(checkTokenAddress(tokenAddress), 'Invalid tokenAddress');
    end;
    
    ---@param address string
    ---@param tokenAddress string
    local function refundBalancesForAddress(address, tokenAddress)
        assertTokenAddress(tokenAddress);
    
        local balance = Balances[tokenAddress][address] and bint(Balances[tokenAddress][address]);
    
        if (balance and balance > bint.zero()) then
            print('Refunding ' .. tostring(balance) .. ' of "' .. tokenAddress .. '" to ' .. address);
            ao.send({
                Target = tokenAddress,
                Tags = {
                    Action = 'Transfer',
                    Recipient = address,
                    Quantity = tostring(balance),
                },
            });
            print('Resetting ' .. address .. '\'s balance of "' .. tokenAddress .. '" to 0');
            Balances[tokenAddress][address] = '0';
        end;
    end;
    
    if (type(IsProcessActive) ~= 'boolean') then
        IsProcessActive = true;
    end;
    
    ---@param handler HandlerFunction
    ---@return HandlerFunction
    local function wrapHandler(handler)
        if (IsProcessActive) then
            return function(msg, env)
                local isOk, res = pcall(handler, msg, env);
    
                if (not isOk) then
                    -- local errMessage = string.gsub(res, '[%w_]*%.lua:%d: ', '');
                    -- if (msg.Tags.Action == 'Credit-Notice') then
                    --     -- Special case for Credit-Notice, since the Balance owner isn't msg.From but msg.Tags.Sender
                    --     refundBalancesForAddress(msg.Tags.Sender, Constants.TOKEN_A.Address);
                    --     refundBalancesForAddress(msg.Tags.Sender, Constants.TOKEN_B.Address);
                    -- else
                    --     refundBalancesForAddress(msg.From, Constants.TOKEN_A.Address);
                    --     refundBalancesForAddress(msg.From, Constants.TOKEN_B.Address);
                    -- end;
    
                    ao.send({
                        Target = msg.From,
                        Tags = {
                            Error = res,
                        },
                    });
    
                    return nil;
                end;
    
                return res;
            end;
        end;
    
        return function(msg)
            ao.send({
                Target = msg.From,
                Tags = {
                    Error = 'Process is currently OFF',
                },
            });
        end;
    end;
    
    ---@type HandlerFunction
    local function handleToggleProcess(msg)
        if (msg.From == ao.id or msg.From == Constants.OWNER_ID) then
            if (msg.Data == 'ON') then
                IsProcessActive = true;
            elseif (msg.Data == 'OFF') then
                IsProcessActive = false;
            end;
        end;
    end;
    
    return {
        bintSqrt = bintSqrt,
        checkTokenAddress = checkTokenAddress,
        assertTokenAddress = assertTokenAddress,
        refundBalancesForAddress = refundBalancesForAddress,
        wrapHandler = wrapHandler,
        handleToggleProcess = handleToggleProcess,
    };
    
  end
  
  _G.package.loaded["utils"] = _loaded_mod_utils()
  
  -- module: "balances"
  local function _loaded_mod_balances()
    local bint  = require('.bint')(256);
    local utils = require('utils');
    
    if (not Balances) then
        ---@type table<string, table<string, string>>
        Balances = {
            [Constants.TOKEN_LP.Address] = {},
            [Constants.TOKEN_A.Address] = {},
            [Constants.TOKEN_B.Address] = {},
        };
        ---@type string
        LPTotalSupply = '0';
    end;
    
    ---@param tokenAddress string
    ---@param userAddress string
    ---@param value Bint
    ---@return nil
    local function setBalance(tokenAddress, userAddress, value)
        utils.assertTokenAddress(tokenAddress);
    
        Balances[tokenAddress][userAddress] = tostring(value);
    end;
    
    ---@param tokenAddress string
    ---@param userAddress string
    ---@return Bint
    local function getBalance(tokenAddress, userAddress)
        utils.assertTokenAddress(tokenAddress);
    
        if (Balances[tokenAddress][userAddress]) then
            return bint(Balances[tokenAddress][userAddress]);
        end;
    
        return bint.zero();
    end;
    
    ---@param tokenAddress string
    ---@param userAddress string
    ---@param amount Bint
    ---@return Bint
    local function addToBalance(tokenAddress, userAddress, amount)
        utils.assertTokenAddress(tokenAddress);
        assert(amount > bint.zero(), 'Amount must be positive');
    
        local currentBalance = getBalance(tokenAddress, userAddress);
        local newBalance = currentBalance + amount;
    
        setBalance(tokenAddress, userAddress, newBalance);
    
        return newBalance;
    end;
    
    ---@param tokenAddress string
    ---@param userAddress string
    ---@param amount Bint
    ---@return Bint
    local function removeFromBalance(tokenAddress, userAddress, amount)
        utils.assertTokenAddress(tokenAddress);
        assert(amount > bint.zero(), 'Amount must be positive');
    
        local currentBalance = getBalance(tokenAddress, userAddress);
        local newBalance = currentBalance - amount;
    
        assert(newBalance >= bint.zero(), 'Invalid amount');
    
        setBalance(tokenAddress, userAddress, newBalance);
    
        return newBalance;
    end;
    
    ---@return Bint
    local function getLPTotalSupply()
        return bint(LPTotalSupply);
    end;
    
    ---@param userAddress string
    ---@return Bint
    local function getLPTokens(userAddress)
        if (Balances[Constants.TOKEN_LP.Address][userAddress]) then
            return bint(Balances[Constants.TOKEN_LP.Address][userAddress]);
        end;
    
        return bint.zero();
    end;
    
    ---@param userAddress string
    ---@param amount Bint
    ---@return Bint
    local function mintLPTokens(userAddress, amount)
        assert(amount > bint.zero(), 'Amount must be positive');
    
        local currentTokens = getLPTokens(userAddress);
        local updatedTokens = currentTokens + amount;
    
        Balances[Constants.TOKEN_LP.Address][userAddress] = tostring(updatedTokens);
        LPTotalSupply = tostring(getLPTotalSupply() + amount); -- Keep lpTotalSupply up-to-date
    
        return updatedTokens;
    end;
    
    ---@param userAddress string
    ---@param amount Bint
    ---@return Bint
    local function burnLPTokens(userAddress, amount)
        assert(bint.__lt(bint.zero(), amount), 'Amount must be positive');
    
        local currentTokens = getLPTokens(userAddress);
        local updatedTokens = bint.__sub(currentTokens, amount);
        assert(bint.__le(bint.zero(), updatedTokens), 'Invalid amount');
    
        Balances[Constants.TOKEN_LP.Address][userAddress] = tostring(updatedTokens);
        LPTotalSupply = tostring(bint.__sub(getLPTotalSupply(), amount)); -- Keep lpTotalSupply up-to-date
    
        return updatedTokens;
    end;
    
    return {
        getBalance = getBalance,
        addToBalance = addToBalance,
        removeFromBalance = removeFromBalance,
        getLPTotalSupply = getLPTotalSupply,
        getLPTokens = getLPTokens,
        mintLPTokens = mintLPTokens,
        burnLPTokens = burnLPTokens,
    };
    
  end
  
  _G.package.loaded["balances"] = _loaded_mod_balances()
  
  -- module: "pool"
  local function _loaded_mod_pool()
    local bint  = require('.bint')(256);
    local json  = require('json');
    local utils = require('utils');
    
    if (not Reserves) then
        ---@type table<string, string>
        Reserves = {
            [Constants.TOKEN_A.Address] = '0',
            [Constants.TOKEN_B.Address] = '0',
        };
    end;
    
    ---@type HandlerFunction
    local function reservesInfoHandler(msg)
        ao.send({
            Target = msg.From,
            Data = json.encode(Reserves),
        });
    end;
    
    ---@param tokenAddress string
    ---@return Bint
    local function getReserve(tokenAddress)
        utils.assertTokenAddress(tokenAddress);
        local reserve = Reserves[tokenAddress];
    
        if reserve == '0' then
            return bint.zero();
        end;
        return bint(reserve);
    end;
    
    ---@param tokenAddress string
    ---@param value Bint
    ---@return nil
    local function setReserve(tokenAddress, value)
        utils.assertTokenAddress(tokenAddress);
    
        Reserves[tokenAddress] = tostring(value);
    end;
    
    ---@param amountIn Bint
    ---@param reserveIn Bint
    ---@param reserveOut Bint
    ---@return Bint
    local function quote(amountIn, reserveIn, reserveOut)
        assert(amountIn > bint.zero(), 'Insufficient amountIn');
        assert(reserveIn > bint.zero() and reserveOut > bint.zero(), 'Insufficient liquidities');
    
        return (amountIn * reserveOut) // reserveIn;
    end;
    
    ---@param amountIn Bint
    ---@param tokenIn string
    ---@param tokenOut string
    local function getAmountOut(amountIn, tokenIn, tokenOut)
        assert(amountIn > bint.zero(), 'Insufficient amountIn');
    
        local reserveIn = getReserve(tokenIn);
        local reserveOut = getReserve(tokenOut);
        assert(reserveIn > bint.zero() and reserveOut > bint.zero(), 'Insufficient liquidity');
    
        local amountInWithFee = amountIn * (bint(1000) - bint(Constants.FEE_RATE * 1000));
        local numerator = amountInWithFee * reserveOut;
        local denominator = (reserveIn * bint(1000)) + amountInWithFee;
    
        return numerator // denominator;
    end;
    
    ---@param tokenA string
    ---@param amountA Bint
    ---@param tokenB string
    ---@param amountB Bint
    ---@return nil
    local function updateReserve(tokenA, amountA, tokenB, amountB)
        utils.assertTokenAddress(tokenA);
        utils.assertTokenAddress(tokenB);
    
        local oldReserveA = getReserve(tokenA);
        local oldReserveB = getReserve(tokenB);
        local newReserveA = oldReserveA + amountA;
        local newReserveB = oldReserveB + amountB;
        local oldK = oldReserveA * oldReserveB;
        local newK = newReserveA * newReserveB;
    
        assert(newReserveA > bint.zero(), 'Insufficient funds in reserve A');
        assert(newReserveB > bint.zero(), 'Insufficient funds in reserve B');
    
        if (amountA >= bint.zero() or amountB >= bint.zero()) then
            assert(newK >= oldK, 'Old K is larger than new K');
        end;
    
        setReserve(tokenA, newReserveA);
        setReserve(tokenB, newReserveB);
    end;
    
    return {
        getReserve = getReserve,
        quote = quote,
        getAmountOut = getAmountOut,
        updateReserve = updateReserve,
        reservesInfoHandler = reservesInfoHandler,
    };
    
  end
  
  _G.package.loaded["pool"] = _loaded_mod_pool()
  
  -- module: "addLiquidity"
  local function _loaded_mod_addLiquidity()
    local bint     = require('.bint')(256);
    local balances = require('balances');
    local pool     = require('pool');
    local utils    = require('utils');
    
    ---@param tokenA string
    ---@param tokenB string
    ---@param desiredAmountA Bint
    ---@param desiredAmountB Bint
    ---@param minAmountA Bint
    ---@param minAmountB Bint
    ---@return Bint, Bint
    local function calculateLiquidity(tokenA, tokenB, desiredAmountA, desiredAmountB, minAmountA, minAmountB)
        local reserveA = pool.getReserve(tokenA);
        local reserveB = pool.getReserve(tokenB);
    
        if (bint.iszero(reserveA) and bint.iszero(reserveB)) then
            return desiredAmountA, desiredAmountB;
        end;
    
        local optimalAmountB = pool.quote(desiredAmountA, reserveA, reserveB);
        if (optimalAmountB <= desiredAmountB) then
            assert(optimalAmountB >= minAmountB, 'Insufficient Token B Amount');
    
            return desiredAmountA, optimalAmountB;
        end;
    
        local optimalAmountA = pool.quote(desiredAmountB, reserveB, reserveA);
        if (optimalAmountA <= desiredAmountA) then
            assert(optimalAmountA >= minAmountA, 'Insufficient Token A Amount');
    
            return optimalAmountA, desiredAmountB;
        end;
    
        error('Impossible flow?'); -- TODO: Find if there's a way to trigger this?
    end;
    
    ---@param tokenA string
    ---@param tokenB string
    ---@param userAddress string
    ---@param minAmountATag string?
    ---@param minAmountBTag string?
    ---@param xNonce string?
    ---@return nil
    local function addLiquidity(tokenA, tokenB, userAddress, minAmountATag, minAmountBTag, xNonce)
        -- Make sure token addresses are valid
        utils.assertTokenAddress(tokenA);
        utils.assertTokenAddress(tokenB);
    
        local minAmountA = minAmountATag and bint(minAmountATag);
        local minAmountB = minAmountBTag and bint(minAmountBTag);
        -- Make sure the min amounts are sent
        assert(minAmountA and minAmountB, 'Missing min amounts');
    
        local desiredAmountA = balances.getBalance(tokenA, userAddress);
        local desiredAmountB = balances.getBalance(tokenB, userAddress);
        -- Make sure tokens have been sent to the pool before calling the Add-Liquidity action
        assert(desiredAmountA > bint.zero() and desiredAmountB > bint.zero(), 'Missing tokens to provide');
    
        local amountA, amountB = calculateLiquidity(
            tokenA,
            tokenB,
            desiredAmountA,
            desiredAmountB,
            minAmountA,
            minAmountB
        );
    
        local totalSupply = balances.getLPTotalSupply();
        local mintedLpTokens = bint.zero();
        local MINIMUM_LIQUIDITY = bint(1000);
        -- Either the pool is new (totalSupply of LP tokens is 0)
        if (bint.iszero(totalSupply)) then
            mintedLpTokens = utils.bintSqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            balances.mintLPTokens(ao.id, MINIMUM_LIQUIDITY);
        else -- Or the pool already has liquidities
            mintedLpTokens = bint.min(
                (amountA * totalSupply) // pool.getReserve(tokenA),
                (amountB * totalSupply) // pool.getReserve(tokenB)
            );
        end;
    
        -- Make sure user provided enough liquidities to earn some LP tokens
        assert(mintedLpTokens > bint.zero(), 'Insufficient liquidities provided');
    
        -- All the checks have been performed, we can now send the tokens to the pool and mint LP tokens to userAddress
        balances.removeFromBalance(tokenA, userAddress, amountA);
        balances.removeFromBalance(tokenB, userAddress, amountB);
    
        pool.updateReserve(tokenA, amountA, tokenB, amountB);
    
        local mintedLPTokens = balances.mintLPTokens(userAddress, mintedLpTokens);
    
        -- Send Credit-Notice to user
        local creditNotice = {
            Target = userAddress,
            Tags = {
                Action = 'Credit-Notice',
                Sender = ao.id,
                Quantity = tostring(mintedLPTokens),
            },
            Data = 'You received ' .. tostring(mintedLPTokens) .. ' from ' .. ao.id,
        };
    
        if (xNonce) then
            creditNotice.Tags['X-ArSwap-Nonce'] = xNonce;
        end;
    
        ao.send(creditNotice);
    end;
    
    
    ---@type HandlerFunction
    local function handleAddLiquidity(msg)
        addLiquidity(
            msg.Tags['Token-A'],
            msg.Tags['Token-B'],
            msg.From,
            msg.Tags['Min-Amount-A'],
            msg.Tags['Min-Amount-B'],
            msg.Tags['X-ArSwap-Nonce']
        );
    end;
    
    return {
        addLiquidity = addLiquidity,
        handleAddLiquidity = handleAddLiquidity,
    };
    
  end
  
  _G.package.loaded["addLiquidity"] = _loaded_mod_addLiquidity()
  
  -- module: "swap"
  local function _loaded_mod_swap()
    local bint     = require('.bint')(256);
    local balances = require('balances');
    local pool     = require('pool');
    local utils    = require('utils');
    
    ---@param tokenIn string
    ---@param userAddress string
    ---@param minimumExpectedOutputTag string?
    ---@param xNonce string?
    local function swap(tokenIn, userAddress, minimumExpectedOutputTag, xNonce)
        utils.assertTokenAddress(tokenIn);
    
        local tokenOut;
        if (tokenIn == Constants.TOKEN_A.Address) then
            tokenOut = Constants.TOKEN_B.Address;
        else
            tokenOut = Constants.TOKEN_A.Address;
        end;
    
        local minimumExpectedOutput = minimumExpectedOutputTag and bint(minimumExpectedOutputTag);
        assert(minimumExpectedOutput and minimumExpectedOutput > bint.zero(),
               'SWAP: Missing minimum expected output');
    
        -- Retrieve the input amount from the user's current balance
        local amountIn = balances.getBalance(tokenIn, userAddress);
        assert(amountIn > bint.zero(), 'SWAP: Missing funds for token A');
    
        -- Calculate the output amount including fees
        local amountOut = pool.getAmountOut(amountIn, tokenIn, tokenOut);
        assert(bint.__le(minimumExpectedOutput, amountOut), 'SWAP: Output amount is lower than the minimum expected output');
    
        balances.removeFromBalance(tokenIn, userAddress, amountIn);
    
        pool.updateReserve(tokenIn, amountIn, tokenOut, bint.zero() - amountOut);
    
        if (amountOut > bint.zero()) then
            local transferMsg = {
                Target = tokenOut,
                Tags = {
                    Action = 'Transfer',
                    Recipient = userAddress,
                    Quantity = tostring(amountOut),
                },
            };
    
            if (xNonce) then
                transferMsg.Tags['X-ArSwap-Nonce'] = xNonce;
            end;
    
            ao.send(transferMsg);
        end;
    end;
    
    ---@type HandlerFunction
    local function handleSwap(msg)
        swap(
            msg.Tags['Token-In'],
            msg.From,
            msg.Tags['Minimum-Expected-Output'],
            msg.Tags['X-ArSwap-Nonce']
        );
    end;
    
    return {
        swap = swap,
        handleSwap = handleSwap,
    };
    
  end
  
  _G.package.loaded["swap"] = _loaded_mod_swap()
  
  -- module: "refund"
  local function _loaded_mod_refund()
    local bint  = require('.bint')(256);
    local utils = require('utils');
    
    ---@type HandlerFunction
    local function refundAllBalances(msg)
        if (msg.From == ao.id) then
            -- Iterate over token A
            for userAddress, balance in pairs(Balances[Constants.TOKEN_A.Address]) do
                if (bint(balance) > bint.zero()) then
                    utils.refundBalancesForAddress(userAddress, Constants.TOKEN_A.Address);
                end;
            end;
    
            -- Iterate over token B
            for userAddress, balance in pairs(Balances[Constants.TOKEN_B.Address]) do
                if (bint(balance) > bint.zero()) then
                    utils.refundBalancesForAddress(userAddress, Constants.TOKEN_B.Address);
                end;
            end;
        end;
    end;
    
    return {
        refundAllHandler = refundAllBalances,
    };
    
  end
  
  _G.package.loaded["refund"] = _loaded_mod_refund()
  
  -- module: "lpToken"
  local function _loaded_mod_lpToken()
    local bint     = require('.bint')(256);
    local json     = require('json');
    local balances = require('balances');
    
    if (not LPTokenName) then
        LPTokenName = Constants.TOKEN_LP.Name;
    end;
    
    if (not LPTokenTicker) then
        LPTokenTicker = Constants.TOKEN_LP.Ticker;
    end;
    
    if (not LPTokenDenomination) then
        LPTokenDenomination = Constants.TOKEN_LP.Denomination;
    end;
    
    if (not LPTokenLogo) then
        LPTokenLogo = Constants.TOKEN_LP.Logo;
    end;
    
    ---@type HandlerFunction
    local function infoHandler(msg)
        local tags = {
            Name = LPTokenName,
            Ticker = LPTokenTicker,
            Denomination = tostring(LPTokenDenomination),
            Logo = LPTokenLogo,
        };
    
        if (msg.Tags['Reserves-Info']) then
            tags['Total-Supply'] = LPTotalSupply;
            tags['Pool-Reserve-A'] = Reserves[Constants.TOKEN_A.Address];
            tags['Pool-Reserve-B'] = Reserves[Constants.TOKEN_B.Address];
        end;
    
        ao.send({
            Target = msg.From,
            Tags = tags,
        });
    end;
    
    ---@type HandlerFunction
    local function totalSupplyHandler(msg)
        ao.send({
            Target = msg.From,
            Data = LPTotalSupply,
        });
    end;
    
    local function balanceHandler(msg)
        local account = msg.Tags.Target or msg.From;
        local bal = balances.getLPTokens(account);
    
        ao.send({
            Target = msg.From,
            Tags = {
                Balance = tostring(bal),
                Ticker = LPTokenTicker,
                Account = account,
            },
            Data = tostring(bal),
        });
    end;
    
    local function balancesHandler(msg)
        ao.send({
            Target = msg.From,
            Data = json.encode(Balances[Constants.TOKEN_LP.Address]),
        });
    end;
    
    local function transferHandler(msg)
        local transferredQuantity = msg.Tags.Quantity and bint(msg.Tags.Quantity);
        assert(type(msg.Tags.Recipient) == 'string', 'Recipient is required');
        assert(transferredQuantity, 'Quantity is required');
        assert(transferredQuantity > bint.zero(), 'Quantity must be positive');
    
        if (not Balances[Constants.TOKEN_LP.Address][msg.From]) then
            Balances[Constants.TOKEN_LP.Address][msg.From] = '0';
        end;
        if (not Balances[Constants.TOKEN_LP.Address][msg.Tags.Recipient]) then
            Balances[Constants.TOKEN_LP.Address][msg.Tags.Recipient] = '0';
        end;
    
        local balFrom = Balances[Constants.TOKEN_LP.Address][msg.From];
        local balRecipient = Balances[Constants.TOKEN_LP.Address][msg.Tags.Recipient];
    
        if (balFrom >= transferredQuantity) then
            Balances[Constants.TOKEN_LP.Address][msg.From] = tostring(bint(balFrom) - transferredQuantity);
            Balances[Constants.TOKEN_LP.Address][msg.Tags.Recipient] = tostring(bint(balRecipient) +
                transferredQuantity);
    
            --[[
                    Only send the notifications to the Sender and Recipient
                    if the Cast tag is not set on the Transfer message
                ]]
            --
            if not msg.Tags.Cast then
                ---@type MessageParam
                local debitNotice = {
                    Target = msg.From,
                    Tags = {
                        Action = 'Debit-Notice',
                        Recipient = msg.Tags.Recipient,
                        Quantity = tostring(transferredQuantity),
                    },
                    Data = 'You transferred ' .. tostring(transferredQuantity) .. ' to ' .. msg.Tags.Recipient,
                };
                ---@type MessageParam
                local creditNotice = {
                    Target = msg.Tags.Recipient,
                    Tags = {
                        Action = 'Credit-Notice',
                        Sender = msg.From,
                        Quantity = tostring(transferredQuantity),
                    },
                    Data = 'You received ' .. tostring(transferredQuantity) .. ' from ' .. msg.Tags.Recipient,
                };
    
                -- Add forwarded tags to the credit and debit notice messages
                for tagName, tagValue in pairs(msg.Tags) do
                    if (string.sub(tagName, 1, 2) == 'X-') then
                        -- Tags beginning with "X-" are forwarded
                        debitNotice.Tags[tagName] = tagValue;
                        creditNotice.Tags[tagName] = tagValue;
                    end;
                end;
    
                -- Send Debit-Notice and Credit-Notice
                ao.send(debitNotice);
                ao.send(creditNotice);
            end;
        else
            ao.send({
                Target = msg.From,
                Action = 'Transfer-Error',
                ['Message-Id'] = msg.Id,
                Error = 'Insufficient Balance',
            });
        end;
    end;
    
    return {
        info = infoHandler,
        totalSupply = totalSupplyHandler,
        balance = balanceHandler,
        balances = balancesHandler,
        transfer = transferHandler,
    };
    
  end
  
  _G.package.loaded["lpToken"] = _loaded_mod_lpToken()
  
  -- module: "removeLiquidity"
  local function _loaded_mod_removeLiquidity()
    local bint = require('.bint')(256);
    local pool = require('pool');
    local balances = require('balances');
    
    ---@type HandlerFunction
    local function removeLiquidity(msg)
        local userAddress = msg.From;
        local lpTokensToBurn = (msg.Tags['Token-Amount'] and bint(msg.Tags['Token-Amount'])) or
            balances.getLPTokens(userAddress);
        assert(lpTokensToBurn >= bint.zero() and lpTokensToBurn <= balances.getLPTokens(userAddress), 'Invalid Token-Amount');
    
        local lpTotalSupply = balances.getLPTotalSupply();
    
        local amountA = bint.zero();
        local amountB = bint.zero();
    
        if (lpTotalSupply > bint.zero() and lpTokensToBurn > bint.zero()) then
            amountA = (lpTokensToBurn * pool.getReserve(Constants.TOKEN_A.Address)) // lpTotalSupply;
            amountB = (lpTokensToBurn * pool.getReserve(Constants.TOKEN_B.Address)) // lpTotalSupply;
        end;
    
        if (amountA > bint.zero() or amountB > bint.zero()) then
            pool.updateReserve(
                Constants.TOKEN_A.Address,
                bint.zero() - amountA,
                Constants.TOKEN_B.Address,
                bint.zero() - amountB
            );
        end;
    
        local balanceA = balances.getBalance(Constants.TOKEN_A.Address, userAddress);
        if (balanceA > bint.zero()) then
            balances.removeFromBalance(Constants.TOKEN_A.Address, userAddress, balanceA);
        end;
    
        local balanceB = balances.getBalance(Constants.TOKEN_B.Address, userAddress);
        if (balanceB > bint.zero()) then
            balances.removeFromBalance(Constants.TOKEN_B.Address, userAddress, balanceB);
        end;
    
        balances.burnLPTokens(userAddress, lpTokensToBurn);
    
        if (amountA + balanceA > bint.zero()) then
            ao.send({
                Target = Constants.TOKEN_A.Address,
                Tags = {
                    Action = 'Transfer',
                    Recipient = userAddress,
                    Quantity = tostring(amountA + balanceA),
                },
            });
        end;
    
        if (amountB + balanceB > bint.zero()) then
            ao.send({
                Target = Constants.TOKEN_B.Address,
                Tags = {
                    Action = 'Transfer',
                    Recipient = userAddress,
                    Quantity = tostring(amountB + balanceB),
                },
            });
        end;
    end;
    
    return {
        removeLiquidity = removeLiquidity,
    };
    
  end
  
  _G.package.loaded["removeLiquidity"] = _loaded_mod_removeLiquidity()
  
  -- module: "creditNotice"
  local function _loaded_mod_creditNotice()
    local bint         = require('.bint')(256);
    local utils        = require('utils');
    local balances     = require('balances');
    local swap         = require('swap');
    local addLiquidity = require('addLiquidity');
    
    if (not AddLiquidityNonces) then
        ---@type table<string, { tokenAddress: string, minAmount: string }>
        AddLiquidityNonces = {};
    end;
    
    ---@param tokenAddress string
    ---@param userAddress string
    ---@param quantity Bint
    ---@param msg Message
    local function handleXTags(tokenAddress, userAddress, quantity, msg)
        -- If the token process forwarded the X-Action Tag, do the swap in the same flow
        if (msg.Tags['X-Action'] == 'Swap') then
            swap.swap(tokenAddress, userAddress, msg.Tags['X-Minimum-Expected-Output'], msg.Tags['X-ArSwap-Nonce']);
        elseif (msg.Tags['X-Action'] == 'Add-Liquidity') then
            local nonce = msg.Tags['X-ArSwap-Nonce'];
            assert(nonce, 'Missing Nonce for the Add-Liquidity');
            local uniqueId = nonce .. ':' .. msg.Tags.Sender; -- Make sure the nonce is unique PER USER
    
            if (AddLiquidityNonces[uniqueId]) then
                if (AddLiquidityNonces[uniqueId].tokenAddress ~= msg.From) then
                    print('2nd transfer received from ' .. msg.Tags.Sender .. ', adding liquidity to the pool');
                    -- We already received a transfer from coinA, remove the nonce and call addLiquidity
                    addLiquidity.addLiquidity(
                        AddLiquidityNonces[uniqueId].tokenAddress,
                        msg.From,
                        msg.Tags.Sender,
                        AddLiquidityNonces[uniqueId].minAmount,
                        msg.Tags['X-Min-Amount'],
                        nonce
                    );
                    AddLiquidityNonces[uniqueId] = nil;
                else
                    -- Else we just received a 2nd transfer from the same tokenAddress, just ignore it.
                end;
            else
                AddLiquidityNonces[uniqueId] = {
                    tokenAddress = msg.From,
                    minAmount = msg.Tags['X-Min-Amount'],
                };
            end;
        else
            -- Else, no X-Action was sent so we notify the sender that we indeed received the tokens
            ao.send({
                Target = msg.Tags.Sender,
                Action = 'Token-Received',
                Tags = {
                    Quantity = tostring(quantity),
                    Token = tokenAddress,
                },
            });
        end;
    end;
    
    ---@type HandlerFunction
    local function handleCreditNotice(msg)
        print('Credit-Notice: ' .. msg.Tags.Quantity .. ' of "' .. msg.From .. '" from ' .. msg.Tags.Sender);
        local quantity = msg.Tags.Quantity and bint(msg.Tags.Quantity);
        local tokenAddress = msg.From;
    
        -- Make sure the received token is either tokenA or tokenB, and quantity is positive
        if (utils.checkTokenAddress(tokenAddress) and quantity and quantity > bint.zero()) then
            local userAddress = msg.Tags.Sender;
            assert(type(userAddress) == 'string', 'Missing Sender');
    
            balances.addToBalance(tokenAddress, userAddress, quantity);
    
            return handleXTags(tokenAddress, userAddress, quantity, msg);
        else
            -- Else do nothing, if people want to send arbitrary tokens to this process they can :)
            return;
        end;
    end;
    
    
    return {
        handleCreditNotice = handleCreditNotice,
    };
    
  end
  
  _G.package.loaded["creditNotice"] = _loaded_mod_creditNotice()
  
  local creditNotice    = require('creditNotice');
  local addLiquidity    = require('addLiquidity');
  local pool            = require('pool');
  local swap            = require('swap');
  local removeLiquidity = require('removeLiquidity');
  local lpToken         = require('lpToken');
  local refund          = require('refund');
  local utils           = require('utils');
  
  Handlers.add(
      'listenForCreditNotices',
      Handlers.utils.hasMatchingTag('Action', 'Credit-Notice'),
      creditNotice.handleCreditNotice
  );
  
  Handlers.add(
      'addLiquidityToPool',
      Handlers.utils.hasMatchingTag('Action', 'Add-Liquidity'),
      utils.wrapHandler(addLiquidity.handleAddLiquidity)
  );
  
  Handlers.add(
      'swapTokens',
      Handlers.utils.hasMatchingTag('Action', 'Swap'),
      utils.wrapHandler(swap.handleSwap)
  );
  
  Handlers.add(
      'removeLiquidityFromPool',
      Handlers.utils.hasMatchingTag('Action', 'Remove-Liquidity'),
      utils.wrapHandler(removeLiquidity.removeLiquidity)
  );
  
  Handlers.add(
      'reserves_info',
      Handlers.utils.hasMatchingTag('Action', 'Reserves'),
      pool.reservesInfoHandler
  );
  
  Handlers.add(
      'lpToken_info',
      Handlers.utils.hasMatchingTag('Action', 'Info'),
      lpToken.info
  );
  
  Handlers.add(
      'lpToken_totalSupply',
      Handlers.utils.hasMatchingTag('Action', 'Total-Supply'),
      lpToken.totalSupply
  );
  
  Handlers.add(
      'lpToken_balance',
      Handlers.utils.hasMatchingTag('Action', 'Balance'),
      lpToken.balance
  );
  
  Handlers.add(
      'lpToken_balances',
      Handlers.utils.hasMatchingTag('Action', 'Balances'),
      lpToken.balances
  );
  
  Handlers.add(
      'lpToken_transfer',
      Handlers.utils.hasMatchingTag('Action', 'Transfer'),
      lpToken.transfer
  );
  
  Handlers.add(
      'toggleProcess',
      Handlers.utils.hasMatchingTag('Action', 'Toggle-Process'),
      utils.handleToggleProcess
  );
  
  Handlers.add(
      'refundAllBalances',
      Handlers.utils.hasMatchingTag('Action', 'Refund-All-Balances'),
      refund.refundAllHandler
  );
  