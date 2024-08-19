

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
    
    ---Resets to nil AddLiquidityNonces for the specified address
    ---@param address string
    local function resetAddLiquidityOperationsForAddress(address)
        -- iterate over AddLiquidityNonces to clear user's pending add liquidity operations
        for uniqueId in pairs(AddLiquidityOperations) do
            if (string.find(uniqueId, ':' .. address)) then
                print('Resetting ' .. address .. '\'s Add-Liquidity Operation ID ' .. uniqueId);
                AddLiquidityOperations[uniqueId] = nil;
            end;
        end;
    end;
    
    return {
        bintSqrt = bintSqrt,
        checkTokenAddress = checkTokenAddress,
        assertTokenAddress = assertTokenAddress,
        refundBalancesForAddress = refundBalancesForAddress,
        resetAddLiquidityOperationsForAddress = resetAddLiquidityOperationsForAddress,
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
    
        print(
            'Updating Balance (Token: '
            .. tokenAddress
            .. ' / User: '
            .. userAddress
            .. ') '
            .. tostring(Balances[tokenAddress][userAddress])
            .. ' -> '
            .. tostring(value)
        );
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
    ---@param amountToRemove Bint
    ---@return Bint
    local function removeFromBalance(tokenAddress, userAddress, amountToRemove)
        utils.assertTokenAddress(tokenAddress);
        assert(amountToRemove > bint.zero(), 'AmountToRemove must be positive');
    
        local currentBalance = getBalance(tokenAddress, userAddress);
        local newBalance = currentBalance - amountToRemove;
    
        assert(newBalance >= bint.zero(), 'Invalid amountToRemove');
    
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
    ---@param amountToAdd Bint
    ---@return Bint
    local function mintLPTokens(userAddress, amountToAdd)
        assert(amountToAdd > bint.zero(), 'AmountToAdd must be positive');
    
        local currentTokens = getLPTokens(userAddress);
        local updatedTokens = currentTokens + amountToAdd;
    
        Balances[Constants.TOKEN_LP.Address][userAddress] = tostring(updatedTokens);
        LPTotalSupply = tostring(getLPTotalSupply() + amountToAdd); -- Keep lpTotalSupply up-to-date
    
        return updatedTokens;
    end;
    
    ---@param userAddress string
    ---@param amount Bint
    ---@return Bint
    local function burnLPTokens(userAddress, amount)
        assert(amount > bint.zero(), 'Amount must be positive');
    
        local currentTokens = getLPTokens(userAddress);
        local updatedTokens = currentTokens - amount;
        assert(updatedTokens >= bint.zero(), 'Invalid amount');
    
        Balances[Constants.TOKEN_LP.Address][userAddress] = tostring(updatedTokens);
        LPTotalSupply = tostring(getLPTotalSupply() - amount); -- Keep lpTotalSupply up-to-date
    
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
    ---@return { amount: Bint, fees: Bint, price: number }
    local function getAmountOut(amountIn, tokenIn, tokenOut)
        assert(amountIn > bint.zero(), 'Insufficient amountIn');
    
        local reserveIn = getReserve(tokenIn);
        local reserveOut = getReserve(tokenOut);
        assert(reserveIn > bint.zero() and reserveOut > bint.zero(), 'Insufficient liquidity');
    
        local amountInWithFee = amountIn * (bint(1000) - bint(Constants.FEE_RATE * 1000));
        local numerator = amountInWithFee * reserveOut;
        local denominator = (reserveIn * bint(1000)) + amountInWithFee;
    
        return {
            amount = numerator // denominator,
            fees = amountIn - (amountInWithFee // bint(1000)),
            price = reserveOut / (denominator // bint(1000)), -- Do not use `//`, we need a floating number here
        };
    end;
    
    ---@param tokenA string
    ---@param amountAToAdd Bint
    ---@param tokenB string
    ---@param amountBToAdd Bint
    ---@return nil
    local function updateReserve(tokenA, amountAToAdd, tokenB, amountBToAdd)
        utils.assertTokenAddress(tokenA);
        utils.assertTokenAddress(tokenB);
    
        local oldReserveA = getReserve(tokenA);
        local oldReserveB = getReserve(tokenB);
        local newReserveA = oldReserveA + amountAToAdd;
        local newReserveB = oldReserveB + amountBToAdd;
        local oldK = oldReserveA * oldReserveB;
        local newK = newReserveA * newReserveB;
    
        assert(newReserveA > bint.zero(), 'Insufficient funds in reserve A');
        assert(newReserveB > bint.zero(), 'Insufficient funds in reserve B');
    
        if (amountAToAdd >= bint.zero() or amountBToAdd >= bint.zero()) then
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
    ---@param tokenAAmount Bint
    ---@param tokenBAmount Bint
    ---@param userAddress string
    ---@param minAmountA Bint
    ---@param minAmountB Bint
    ---@return nil
    local function addLiquidity(tokenA, tokenB, tokenAAmount, tokenBAmount, userAddress, minAmountA, minAmountB)
        -- Make sure token addresses are valid
        utils.assertTokenAddress(tokenA);
        utils.assertTokenAddress(tokenB);
    
        assert(tokenAAmount > bint.zero(), 'ADD-LIQUIDITY: Invalid token A amount');
        assert(tokenBAmount > bint.zero(), 'ADD-LIQUIDITY: Invalid token B amount');
    
        local amountA, amountB = calculateLiquidity(
            tokenA,
            tokenB,
            tokenAAmount,
            tokenBAmount,
            minAmountA,
            minAmountB
        );
    
        local totalSupply = balances.getLPTotalSupply();
        local lpTokensToMint = bint.zero();
        local MINIMUM_LIQUIDITY = bint(1000);
        -- Either the pool is new (totalSupply of LP tokens is 0)
        if (bint.iszero(totalSupply)) then
            lpTokensToMint = utils.bintSqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            balances.mintLPTokens(ao.id, MINIMUM_LIQUIDITY);
        else -- Or the pool already has liquidities
            lpTokensToMint = bint.min(
                (amountA * totalSupply) // pool.getReserve(tokenA),
                (amountB * totalSupply) // pool.getReserve(tokenB)
            );
        end;
    
        -- Make sure user provided enough liquidities to earn some LP tokens
        assert(lpTokensToMint > bint.zero(), 'ADD-LIQUIDITY: Insufficient liquidities provided');
    
        -- All the checks have been performed, we can now send the tokens to the pool and mint LP tokens to userAddress
        balances.removeFromBalance(tokenA, userAddress, amountA);
        balances.removeFromBalance(tokenB, userAddress, amountB);
    
        pool.updateReserve(tokenA, amountA, tokenB, amountB);
    
        local updatedLpTokens = balances.mintLPTokens(userAddress, lpTokensToMint);
        print(
            'Minted '
            .. tostring(lpTokensToMint)
            .. ' LP tokens for '
            .. userAddress
            .. ' (total: '
            .. tostring(updatedLpTokens)
            .. ')'
        );
    
        -- Send Credit-Notice to user
        ao.send({
            Target = userAddress,
            Tags = {
                Action = 'Credit-Notice',
                Sender = ao.id,
                Quantity = tostring(lpTokensToMint),
                ['X-Balance'] = tostring(updatedLpTokens),
            },
            Data = 'You received ' .. tostring(lpTokensToMint) .. ' from ' .. ao.id,
        });
    end;
    
    
    return {
        addLiquidity = addLiquidity,
    };
    
    end
    
    _G.package.loaded["addLiquidity"] = _loaded_mod_addLiquidity()
    
    -- module: "md5"
    local function _loaded_mod_md5()
    local md5 = {
        _VERSION     = 'md5.lua 1.1.0',
        _DESCRIPTION = 'MD5 computation in Lua (5.1-3, LuaJIT)',
        _URL         = 'https://github.com/kikito/md5.lua',
        _LICENSE     = [[
        MIT LICENSE
    
        Copyright (c) 2013 Enrique García Cota + Adam Baldwin + hanzao + Equi 4 Software
    
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files (the
        "Software"), to deal in the Software without restriction, including
        without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to
        permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
    
        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.
    
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      ]],
    };
    
    -- bit lib implementions
    
    local char, byte, format, rep, sub =
        string.char, string.byte, string.format, string.rep, string.sub;
    local bit_or, bit_and, bit_not, bit_xor, bit_rshift, bit_lshift;
    
    local ok, bit = pcall(require, 'bit');
    local ok_ffi, ffi = pcall(require, 'ffi');
    if ok then
        bit_or, bit_and, bit_not, bit_xor, bit_rshift, bit_lshift = bit.bor, bit.band, bit.bnot, bit.bxor, bit.rshift,
            bit.lshift;
    else
        ok, bit = pcall(require, 'bit32');
    
        if ok then
            bit_not = bit.bnot;
    
            local tobit = function(n)
                return n <= 0x7fffffff and n or -(bit_not(n) + 1);
            end;
    
            local normalize = function(f)
                return function(a, b) return tobit(f(tobit(a), tobit(b))); end;
            end;
    
            bit_or, bit_and, bit_xor = normalize(bit.bor), normalize(bit.band), normalize(bit.bxor);
            bit_rshift, bit_lshift = normalize(bit.rshift), normalize(bit.lshift);
        else
            local function tbl2number(tbl)
                local result = 0;
                local power = 1;
                for i = 1, #tbl do
                    result = result + tbl[i] * power;
                    power = power * 2;
                end;
                return result;
            end;
    
            local function expand(t1, t2)
                local big, small = t1, t2;
                if (#big < #small) then
                    big, small = small, big;
                end;
                -- expand small
                for i = #small + 1, #big do
                    small[i] = 0;
                end;
            end;
    
            local to_bits; -- needs to be declared before bit_not
    
            bit_not = function(n)
                local tbl = to_bits(n);
                local size = math.max(#tbl, 32);
                for i = 1, size do
                    if (tbl[i] == 1) then
                        tbl[i] = 0;
                    else
                        tbl[i] = 1;
                    end;
                end;
                return tbl2number(tbl);
            end;
    
            -- defined as local above
            to_bits = function(n)
                if (n < 0) then
                    -- negative
                    return to_bits(bit_not(math.abs(n)) + 1);
                end;
                -- to bits table
                local tbl = {};
                local cnt = 1;
                local last;
                while n > 0 do
                    last     = n % 2;
                    tbl[cnt] = last;
                    n        = (n - last) / 2;
                    cnt      = cnt + 1;
                end;
    
                return tbl;
            end;
    
            bit_or = function(m, n)
                local tbl_m = to_bits(m);
                local tbl_n = to_bits(n);
                expand(tbl_m, tbl_n);
    
                local tbl = {};
                for i = 1, #tbl_m do
                    if (tbl_m[i] == 0 and tbl_n[i] == 0) then
                        tbl[i] = 0;
                    else
                        tbl[i] = 1;
                    end;
                end;
    
                return tbl2number(tbl);
            end;
    
            bit_and = function(m, n)
                local tbl_m = to_bits(m);
                local tbl_n = to_bits(n);
                expand(tbl_m, tbl_n);
    
                local tbl = {};
                for i = 1, #tbl_m do
                    if (tbl_m[i] == 0 or tbl_n[i] == 0) then
                        tbl[i] = 0;
                    else
                        tbl[i] = 1;
                    end;
                end;
    
                return tbl2number(tbl);
            end;
    
            bit_xor = function(m, n)
                local tbl_m = to_bits(m);
                local tbl_n = to_bits(n);
                expand(tbl_m, tbl_n);
    
                local tbl = {};
                for i = 1, #tbl_m do
                    if (tbl_m[i] ~= tbl_n[i]) then
                        tbl[i] = 1;
                    else
                        tbl[i] = 0;
                    end;
                end;
    
                return tbl2number(tbl);
            end;
    
            bit_rshift = function(n, bits)
                local high_bit = 0;
                if (n < 0) then
                    -- negative
                    n = bit_not(math.abs(n)) + 1;
                    high_bit = 0x80000000;
                end;
    
                local floor = math.floor;
    
                for i = 1, bits do
                    n = n / 2;
                    n = bit_or(floor(n), high_bit);
                end;
                return floor(n);
            end;
    
            bit_lshift = function(n, bits)
                if (n < 0) then
                    -- negative
                    n = bit_not(math.abs(n)) + 1;
                end;
    
                for i = 1, bits do
                    n = n * 2;
                end;
                return bit_and(n, 0xFFFFFFFF);
            end;
        end;
    end;
    
    -- convert little-endian 32-bit int to a 4-char string
    local lei2str;
    -- function is defined this way to allow full jit compilation (removing UCLO instruction in LuaJIT)
    if ok_ffi then
        local ct_IntType = ffi.typeof('int[1]');
        lei2str = function(i) return ffi.string(ct_IntType(i), 4); end;
    else
        lei2str = function(i)
            local f = function(s) return char(bit_and(bit_rshift(i, s), 255)); end;
            return f(0) .. f(8) .. f(16) .. f(24);
        end;
    end;
    
    
    
    -- convert raw string to big-endian int
    local function str2bei(s)
        local v = 0;
        for i = 1, #s do
            v = v * 256 + byte(s, i);
        end;
        return v;
    end;
    
    -- convert raw string to little-endian int
    local str2lei;
    
    if ok_ffi then
        local ct_constcharptr = ffi.typeof('const char*');
        local ct_constintptr = ffi.typeof('const int*');
        str2lei = function(s)
            local int = ct_constcharptr(s);
            return ffi.cast(ct_constintptr, int)[0];
        end;
    else
        str2lei = function(s)
            local v = 0;
            for i = #s, 1, -1 do
                v = v * 256 + byte(s, i);
            end;
            return v;
        end;
    end;
    
    
    -- cut up a string in little-endian ints of given size
    local function cut_le_str(s)
        return {
            str2lei(sub(s, 1, 4)),
            str2lei(sub(s, 5, 8)),
            str2lei(sub(s, 9, 12)),
            str2lei(sub(s, 13, 16)),
            str2lei(sub(s, 17, 20)),
            str2lei(sub(s, 21, 24)),
            str2lei(sub(s, 25, 28)),
            str2lei(sub(s, 29, 32)),
            str2lei(sub(s, 33, 36)),
            str2lei(sub(s, 37, 40)),
            str2lei(sub(s, 41, 44)),
            str2lei(sub(s, 45, 48)),
            str2lei(sub(s, 49, 52)),
            str2lei(sub(s, 53, 56)),
            str2lei(sub(s, 57, 60)),
            str2lei(sub(s, 61, 64)),
        };
    end;
    
    -- An MD5 mplementation in Lua, requires bitlib (hacked to use LuaBit from above, ugh)
    -- 10/02/2001 jcw@equi4.com
    
    local CONSTS = {
        0xd76aa478,
        0xe8c7b756,
        0x242070db,
        0xc1bdceee,
        0xf57c0faf,
        0x4787c62a,
        0xa8304613,
        0xfd469501,
        0x698098d8,
        0x8b44f7af,
        0xffff5bb1,
        0x895cd7be,
        0x6b901122,
        0xfd987193,
        0xa679438e,
        0x49b40821,
        0xf61e2562,
        0xc040b340,
        0x265e5a51,
        0xe9b6c7aa,
        0xd62f105d,
        0x02441453,
        0xd8a1e681,
        0xe7d3fbc8,
        0x21e1cde6,
        0xc33707d6,
        0xf4d50d87,
        0x455a14ed,
        0xa9e3e905,
        0xfcefa3f8,
        0x676f02d9,
        0x8d2a4c8a,
        0xfffa3942,
        0x8771f681,
        0x6d9d6122,
        0xfde5380c,
        0xa4beea44,
        0x4bdecfa9,
        0xf6bb4b60,
        0xbebfbc70,
        0x289b7ec6,
        0xeaa127fa,
        0xd4ef3085,
        0x04881d05,
        0xd9d4d039,
        0xe6db99e5,
        0x1fa27cf8,
        0xc4ac5665,
        0xf4292244,
        0x432aff97,
        0xab9423a7,
        0xfc93a039,
        0x655b59c3,
        0x8f0ccc92,
        0xffeff47d,
        0x85845dd1,
        0x6fa87e4f,
        0xfe2ce6e0,
        0xa3014314,
        0x4e0811a1,
        0xf7537e82,
        0xbd3af235,
        0x2ad7d2bb,
        0xeb86d391,
        0x67452301,
        0xefcdab89,
        0x98badcfe,
        0x10325476,
    };
    
    local f = function(x, y, z) return bit_or(bit_and(x, y), bit_and(-x - 1, z)); end;
    local g = function(x, y, z) return bit_or(bit_and(x, z), bit_and(y, -z - 1)); end;
    local h = function(x, y, z) return bit_xor(x, bit_xor(y, z)); end;
    local i = function(x, y, z) return bit_xor(y, bit_or(x, -z - 1)); end;
    local z = function(ff, a, b, c, d, x, s, ac)
        a = bit_and(a + ff(b, c, d) + x + ac, 0xFFFFFFFF);
        -- be *very* careful that left shift does not cause rounding!
        return bit_or(bit_lshift(bit_and(a, bit_rshift(0xFFFFFFFF, s)), s), bit_rshift(a, 32 - s)) + b;
    end;
    
    local function transform(A, B, C, D, X)
        local a, b, c, d = A, B, C, D;
        local t = CONSTS;
    
        a = z(f, a, b, c, d, X[0], 7, t[1]);
        d = z(f, d, a, b, c, X[1], 12, t[2]);
        c = z(f, c, d, a, b, X[2], 17, t[3]);
        b = z(f, b, c, d, a, X[3], 22, t[4]);
        a = z(f, a, b, c, d, X[4], 7, t[5]);
        d = z(f, d, a, b, c, X[5], 12, t[6]);
        c = z(f, c, d, a, b, X[6], 17, t[7]);
        b = z(f, b, c, d, a, X[7], 22, t[8]);
        a = z(f, a, b, c, d, X[8], 7, t[9]);
        d = z(f, d, a, b, c, X[9], 12, t[10]);
        c = z(f, c, d, a, b, X[10], 17, t[11]);
        b = z(f, b, c, d, a, X[11], 22, t[12]);
        a = z(f, a, b, c, d, X[12], 7, t[13]);
        d = z(f, d, a, b, c, X[13], 12, t[14]);
        c = z(f, c, d, a, b, X[14], 17, t[15]);
        b = z(f, b, c, d, a, X[15], 22, t[16]);
    
        a = z(g, a, b, c, d, X[1], 5, t[17]);
        d = z(g, d, a, b, c, X[6], 9, t[18]);
        c = z(g, c, d, a, b, X[11], 14, t[19]);
        b = z(g, b, c, d, a, X[0], 20, t[20]);
        a = z(g, a, b, c, d, X[5], 5, t[21]);
        d = z(g, d, a, b, c, X[10], 9, t[22]);
        c = z(g, c, d, a, b, X[15], 14, t[23]);
        b = z(g, b, c, d, a, X[4], 20, t[24]);
        a = z(g, a, b, c, d, X[9], 5, t[25]);
        d = z(g, d, a, b, c, X[14], 9, t[26]);
        c = z(g, c, d, a, b, X[3], 14, t[27]);
        b = z(g, b, c, d, a, X[8], 20, t[28]);
        a = z(g, a, b, c, d, X[13], 5, t[29]);
        d = z(g, d, a, b, c, X[2], 9, t[30]);
        c = z(g, c, d, a, b, X[7], 14, t[31]);
        b = z(g, b, c, d, a, X[12], 20, t[32]);
    
        a = z(h, a, b, c, d, X[5], 4, t[33]);
        d = z(h, d, a, b, c, X[8], 11, t[34]);
        c = z(h, c, d, a, b, X[11], 16, t[35]);
        b = z(h, b, c, d, a, X[14], 23, t[36]);
        a = z(h, a, b, c, d, X[1], 4, t[37]);
        d = z(h, d, a, b, c, X[4], 11, t[38]);
        c = z(h, c, d, a, b, X[7], 16, t[39]);
        b = z(h, b, c, d, a, X[10], 23, t[40]);
        a = z(h, a, b, c, d, X[13], 4, t[41]);
        d = z(h, d, a, b, c, X[0], 11, t[42]);
        c = z(h, c, d, a, b, X[3], 16, t[43]);
        b = z(h, b, c, d, a, X[6], 23, t[44]);
        a = z(h, a, b, c, d, X[9], 4, t[45]);
        d = z(h, d, a, b, c, X[12], 11, t[46]);
        c = z(h, c, d, a, b, X[15], 16, t[47]);
        b = z(h, b, c, d, a, X[2], 23, t[48]);
    
        a = z(i, a, b, c, d, X[0], 6, t[49]);
        d = z(i, d, a, b, c, X[7], 10, t[50]);
        c = z(i, c, d, a, b, X[14], 15, t[51]);
        b = z(i, b, c, d, a, X[5], 21, t[52]);
        a = z(i, a, b, c, d, X[12], 6, t[53]);
        d = z(i, d, a, b, c, X[3], 10, t[54]);
        c = z(i, c, d, a, b, X[10], 15, t[55]);
        b = z(i, b, c, d, a, X[1], 21, t[56]);
        a = z(i, a, b, c, d, X[8], 6, t[57]);
        d = z(i, d, a, b, c, X[15], 10, t[58]);
        c = z(i, c, d, a, b, X[6], 15, t[59]);
        b = z(i, b, c, d, a, X[13], 21, t[60]);
        a = z(i, a, b, c, d, X[4], 6, t[61]);
        d = z(i, d, a, b, c, X[11], 10, t[62]);
        c = z(i, c, d, a, b, X[2], 15, t[63]);
        b = z(i, b, c, d, a, X[9], 21, t[64]);
    
        return bit_and(A + a, 0xFFFFFFFF), bit_and(B + b, 0xFFFFFFFF),
            bit_and(C + c, 0xFFFFFFFF), bit_and(D + d, 0xFFFFFFFF);
    end;
    
    ----------------------------------------------------------------
    
    local function md5_update(self, s)
        self.pos = self.pos + #s;
        s = self.buf .. s;
        for ii = 1, #s - 63, 64 do
            local X = cut_le_str(sub(s, ii, ii + 63));
            assert(#X == 16);
            X[0] = table.remove(X, 1); -- zero based!
            self.a, self.b, self.c, self.d = transform(self.a, self.b, self.c, self.d, X);
        end;
        self.buf = sub(s, math.floor(#s / 64) * 64 + 1, #s);
        return self;
    end;
    
    local function md5_finish(self)
        local msgLen = self.pos;
        local padLen = 56 - msgLen % 64;
    
        if msgLen % 64 > 56 then padLen = padLen + 64; end;
    
        if padLen == 0 then padLen = 64; end;
    
        local s = char(128) ..
            rep(char(0), padLen - 1) .. lei2str(bit_and(8 * msgLen, 0xFFFFFFFF)) .. lei2str(math.floor(msgLen / 0x20000000));
        md5_update(self, s);
    
        assert(self.pos % 64 == 0);
        return lei2str(self.a) .. lei2str(self.b) .. lei2str(self.c) .. lei2str(self.d);
    end;
    
    ----------------------------------------------------------------
    
    function md5.new()
        return {
            a = CONSTS[65],
            b = CONSTS[66],
            c = CONSTS[67],
            d = CONSTS[68],
            pos = 0,
            buf = '',
            update = md5_update,
            finish = md5_finish,
        };
    end;
    
    function md5.tohex(s)
        return format('%08x%08x%08x%08x', str2bei(sub(s, 1, 4)), str2bei(sub(s, 5, 8)), str2bei(sub(s, 9, 12)),
                      str2bei(sub(s, 13, 16)));
    end;
    
    function md5.sum(s)
        return md5.new():update(s):finish();
    end;
    
    function md5.sumhexa(s)
        return md5.tohex(md5.sum(s));
    end;
    
    return md5;
    
    end
    
    _G.package.loaded["md5"] = _loaded_mod_md5()
    
    -- module: "swap"
    local function _loaded_mod_swap()
    local bint     = require('.bint')(256);
    local pool     = require('pool');
    local balances = require('balances');
    local utils    = require('utils');
    
    ---@param tokenIn string
    ---@param amountIn Bint
    ---@param userAddress string
    ---@param minimumExpectedOutputTag string?
    local function swap(tokenIn, amountIn, userAddress, minimumExpectedOutputTag)
        utils.assertTokenAddress(tokenIn);
    
        local tokenOut;
        if (tokenIn == Constants.TOKEN_A.Address) then
            tokenOut = Constants.TOKEN_B.Address;
        else
            tokenOut = Constants.TOKEN_A.Address;
        end;
    
        local minimumExpectedOutput = minimumExpectedOutputTag and bint(minimumExpectedOutputTag);
        assert(
            minimumExpectedOutput and minimumExpectedOutput > bint.zero(),
            'SWAP: Missing minimum expected output'
        );
        assert(amountIn > bint.zero(), 'SWAP: Invalid amount');
    
        -- Calculate the output amount including fees
        local amountOut = pool.getAmountOut(amountIn, tokenIn, tokenOut);
        assert(amountOut.amount >= minimumExpectedOutput, 'SWAP: Output amount is lower than the minimum expected output');
    
        if (amountOut.amount > bint.zero()) then
            pool.updateReserve(tokenIn, amountIn, tokenOut, bint.zero() - amountOut.amount); -- Add amountIn to reserve + remove amountOut from reserve
            balances.removeFromBalance(tokenIn, userAddress, amountIn);                      -- Remove amountIn from user's balance (since it was added to the reserve)
    
            ao.send({
                Target = tokenOut,
                Tags = {
                    Action = 'Transfer',
                    Recipient = userAddress,
                    Quantity = tostring(amountOut.amount),
                    ['X-Fees'] = tostring(amountOut.fees),
                    ['X-Price'] = tostring(amountOut.price),
                },
            });
        end;
    end;
    
    return {
        swap = swap,
    };
    
    end
    
    _G.package.loaded["swap"] = _loaded_mod_swap()
    
    -- module: "creditNotice"
    local function _loaded_mod_creditNotice()
    local bint         = require('.bint')(256);
    local addLiquidity = require('addLiquidity');
    local balances     = require('balances');
    local md5          = require('md5');
    local swap         = require('swap');
    local utils        = require('utils');
    
    if (not AddLiquidityOperations) then
        ---@type table<string, { tokenAddress: string, minAmount: string, quantity: string }>
        AddLiquidityOperations = {};
    end;
    
    ---@param tokenAddress string
    ---@param userAddress string
    ---@param quantity Bint
    ---@param msg Message
    local function handleXTags(tokenAddress, userAddress, quantity, msg)
        -- If the token process forwarded the X-Operation-Type Tag, do the swap in the same flow
        if (CurrentOperation.type == 'Swap') then
            swap.swap(tokenAddress, quantity, userAddress, msg.Tags['X-Minimum-Expected-Output']);
        elseif (CurrentOperation.type == 'Add-Liquidity') then
            assert(
                msg.Tags['X-Operation-Id'] and msg.Tags['X-Operation-Id'] ~= '',
                'ADD-LIQUIDITY: Missing Operation-Id'
            );
            assert(
                msg.Tags['X-Min-Amount'] and bint(msg.Tags['X-Min-Amount']),
                'ADD-LIQUIDITY: Missing Min-Amount'
            );
            local uniqueId = md5.sumhexa(msg.Tags['X-Operation-Id']) .. ':' .. msg.Tags.Sender; -- Make sure the nonce is unique PER USER
    
            if (AddLiquidityOperations[uniqueId]) then
                if (AddLiquidityOperations[uniqueId].tokenAddress ~= msg.From) then
                    print('2nd transfer received from ' .. msg.Tags.Sender .. ', adding liquidity to the pool');
                    local tokenA = AddLiquidityOperations[uniqueId];
    
                    addLiquidity.addLiquidity(
                        tokenA.tokenAddress,
                        msg.From,
                        bint(tokenA.quantity),
                        quantity,
                        msg.Tags.Sender,
                        bint(tokenA.minAmount),
                        bint(msg.Tags['X-Min-Amount'])
                    );
                    AddLiquidityOperations[uniqueId] = nil;
                else
                    -- Else we received a 2nd transfer from the same tokenAddress,
                    -- overwrite the previous with new one
                    AddLiquidityOperations[uniqueId] = {
                        tokenAddress = msg.From,
                        minAmount = msg.Tags['X-Min-Amount'],
                        quantity = tostring(quantity),
                    };
                end;
            else
                AddLiquidityOperations[uniqueId] = {
                    tokenAddress = msg.From,
                    minAmount = msg.Tags['X-Min-Amount'],
                    quantity = tostring(quantity),
                };
            end;
        else
            -- Else, unknown X-Operation-Type was sent so we do nothing
        end;
    end;
    
    ---@type HandlerFunction
    local function handleCreditNotice(msg)
        local tokenAddress = msg.Tags['From-Process'];
        assert(type(tokenAddress) == 'string', 'Credit-Notice: Missing From-Process');
    
        local quantity = msg.Tags.Quantity and bint(msg.Tags.Quantity);
        assert(quantity and quantity > bint.zero(), 'Credit-Notice: Missing Quantity');
    
        local userAddress = msg.Tags.Sender;
        assert(type(userAddress) == 'string', 'Credit-Notice: Missing Sender');
    
        print('Credit-Notice: ' .. tostring(quantity) .. ' of ' .. tokenAddress .. ' from ' .. userAddress);
    
        -- Make sure the received token is either tokenA or tokenB
        if (utils.checkTokenAddress(tokenAddress)) then
            -- Save received quantity in user's balance
            balances.addToBalance(tokenAddress, userAddress, quantity);
    
            if (CurrentOperation) then
                CurrentOperation.refund = {
                    tokenAddress = tokenAddress,
                    recipient = userAddress,
                    quantity = tostring(quantity),
                };
    
                return handleXTags(tokenAddress, userAddress, quantity, msg);
            end;
        else
            -- Else, send back what we received
            ao.send({
                Target = tokenAddress,
                Tags = {
                    Action = 'Transfer',
                    Recipient = userAddress,
                    Quantity = tostring(quantity),
                },
            });
            return;
        end;
    end;
    
    
    return {
        handleCreditNotice = handleCreditNotice,
    };
    
    end
    
    _G.package.loaded["creditNotice"] = _loaded_mod_creditNotice()
    
    -- module: "error"
    local function _loaded_mod_error()
    local bint     = require('.bint')(256);
    local md5      = require('md5');
    local balances = require('balances');
    
    ---@param handler HandlerFunction
    ---@return HandlerFunction
    local function catchError(handler)
        return function(msg, env)
            local isOk, res = pcall(handler, msg, env);
    
            if (not isOk) then
                local errMessage = string.gsub(res, '[%w_]*%.lua:%d: ', '');
                print('Error: ' .. errMessage);
    
                if (CurrentOperation) then
                    local refund = CurrentOperation.refund;
                    if (refund) then
                        balances.removeFromBalance(
                            refund.tokenAddress,
                            refund.recipient,
                            bint(refund.quantity)
                        );
                        ao.send({
                            Target = refund.tokenAddress,
                            Tags = {
                                Action = 'Transfer',
                                Recipient = refund.recipient,
                                Quantity = refund.quantity,
                            },
                        });
    
                        -- Refund the other token if the operation was Add-Liquidity
                        if (CurrentOperation.type == 'Add-Liquidity' and msg.Tags['X-Operation-Id']) then
                            local uniqueId = md5.sumhexa(msg.Tags['X-Operation-Id']) .. ':' .. refund.recipient;
                            local tokenBRefund = AddLiquidityOperations[uniqueId];
                            if (tokenBRefund) then
                                balances.removeFromBalance(
                                    tokenBRefund.tokenAddress,
                                    refund.recipient,
                                    bint(tokenBRefund.quantity)
                                );
                                ao.send({
                                    Target = tokenBRefund.tokenAddress,
                                    Tags = {
                                        Action = 'Transfer',
                                        Recipient = refund.recipient,
                                        Quantity = tokenBRefund.quantity,
                                    },
                                });
                                AddLiquidityOperations[uniqueId] = nil;
                            end;
                        end;
                    end;
                end;
    
                local errorMsg = {
                    Target = msg.From,
                    Tags = {
                        Error = res,
                        ['X-Operation-Status'] = 'error',
                    },
                };
                if (CurrentOperation) then
                    errorMsg.Tags['X-Operation-Type'] = CurrentOperation.type;
                end;
                ao.send(errorMsg);
    
                return nil;
            end;
    
            return res;
        end;
    end;
    
    return {
        catchError = catchError,
    };
    
    end
    
    _G.package.loaded["error"] = _loaded_mod_error()
    
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
                    utils.resetAddLiquidityOperationsForAddress(userAddress);
                end;
            end;
    
            -- Iterate over token B
            for userAddress, balance in pairs(Balances[Constants.TOKEN_B.Address]) do
                if (bint(balance) > bint.zero()) then
                    utils.refundBalancesForAddress(userAddress, Constants.TOKEN_B.Address);
                    utils.resetAddLiquidityOperationsForAddress(userAddress);
                end;
            end;
        end;
    end;
    
    return {
        refundAllHandler = refundAllBalances,
    };
    
    end
    
    _G.package.loaded["refund"] = _loaded_mod_refund()
    
    -- module: "removeLiquidity"
    local function _loaded_mod_removeLiquidity()
    local bint     = require('.bint')(256);
    local pool     = require('pool');
    local balances = require('balances');
    local utils    = require('utils');
    
    ---@type HandlerFunction
    local function removeLiquidity(msg)
        local userAddress = msg.From;
        local lpTokensToBurn = (msg.Tags['Token-Amount'] and bint(msg.Tags['Token-Amount'])) or
            balances.getLPTokens(userAddress);
        assert(
            lpTokensToBurn >= bint.zero() and lpTokensToBurn <= balances.getLPTokens(userAddress),
            'REMOVE-LIQUIDITY: Invalid Token-Amount'
        );
    
        local lpTotalSupply = balances.getLPTotalSupply();
    
        local amountA = bint.zero();
        local amountB = bint.zero();
    
        if (lpTotalSupply > bint.zero() and lpTokensToBurn > bint.zero()) then
            amountA = (lpTokensToBurn * pool.getReserve(Constants.TOKEN_A.Address)) // lpTotalSupply;
            amountB = (lpTokensToBurn * pool.getReserve(Constants.TOKEN_B.Address)) // lpTotalSupply;
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
    
        if (amountA > bint.zero() or amountB > bint.zero()) then
            pool.updateReserve(
                Constants.TOKEN_A.Address,
                bint.zero() - amountA,
                Constants.TOKEN_B.Address,
                bint.zero() - amountB
            );
        end;
    
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
    
        -- Reset Add-Liquidity Operations
        utils.resetAddLiquidityOperationsForAddress(userAddress);
    end;
    
    return {
        removeLiquidity = removeLiquidity,
    };
    
    end
    
    _G.package.loaded["removeLiquidity"] = _loaded_mod_removeLiquidity()
    
    local creditNotice    = require('creditNotice');
    local error           = require('error');
    local lpToken         = require('lpToken');
    local pool            = require('pool');
    local refund          = require('refund');
    local removeLiquidity = require('removeLiquidity');
    
    --[[
         Operation object used throughout an ArSwap operation
         (swap, add liquidity, remove liquidity)
       ]]
    --
    
    
    ---@type { type: string; refund: { tokenAddress: string; recipient: string; quantity: string } | nil } | nil
    CurrentOperation = nil;
    
    -- WARNING: Need to remove first to avoid duplicating the handler with .after()
    Handlers.remove('setOperationId');
    Handlers.after('_eval').add(
        'setOperationId',
        function() return 'continue'; end,
        function(msg)
            local action = msg.Tags['Action'] or '_NO_ACTION_';
            local opType = msg.Tags['X-Operation-Type'];
    
            print(
                'Action = "' .. action
                .. '" / OperationType = "' .. tostring(opType)
                .. '" / Pushed-For = "' .. tostring(msg['Pushed-For'])
                .. '"'
            );
            if (type(opType) == 'string') then
                CurrentOperation = {
                    type = opType,
                    refund = nil,
                };
            else
                -- Reset the CurrentOperation object
                CurrentOperation = nil;
            end;
        end
    );
    
    Handlers.add(
        'listenForCreditNotices',
        Handlers.utils.hasMatchingTag('Action', 'Credit-Notice'),
        error.catchError(creditNotice.handleCreditNotice)
    );
    
    Handlers.add(
        'removeLiquidityFromPool',
        Handlers.utils.hasMatchingTag('Action', 'Remove-Liquidity'),
        error.catchError(removeLiquidity.removeLiquidity)
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
        'refundAllBalances',
        Handlers.utils.hasMatchingTag('Action', 'Refund-All-Balances'),
        refund.refundAllHandler
    );
    