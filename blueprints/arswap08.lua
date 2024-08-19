
if not Utils.includes('.crypto.init', Utils.keys(_G.package.loaded)) then
    -- if crypto.init is not installed then return a noop
    _G.package.loaded['.crypto.init'] = { _version = "0.0.0", status = "Not Implemented" }
    return [[
        Phase I Completed
        Since you have an older version of AOS, you need to update twice. 
        
        Please run [.update] again
            ]]
end

local function load_utils() 
    local utils = { _version = "0.0.5" }

    function utils.matchesPattern(pattern, value, msg)
        -- If the key is not in the message, then it does not match
        if not pattern then
            return false
        end
        -- if the patternMatchSpec is a wildcard, then it always matches
        if pattern == '_' then
            return true
        end
        -- if the patternMatchSpec is a function, then it is executed on the tag value
        if type(pattern) == "function" then
            if pattern(value, msg) then
                return true
            else
                return false
            end
        end
        
        -- if the patternMatchSpec is a string, check it for special symbols (less `-` alone)
        -- and exact string match mode
        if type(pattern) == 'string' then
            if string.match(pattern, "[%^%$%(%)%%%.%[%]%*%+%?]") then
                if string.match(value, pattern) then
                    return true
                end
            else
                if value == pattern then
                    return true
                end
            end
        end
    
        -- if the pattern is a table, recursively check if any of its sub-patterns match
        if type(pattern) == 'table' then
            for _, subPattern in pairs(pattern) do
                if utils.matchesPattern(subPattern, value, msg) then
                    return true
                end
            end
        end
    
        return false
    end

    function utils.matchesSpec(msg, spec)
        if type(spec) == 'function' then
            return spec(msg)
        -- If the spec is a table, step through every key/value pair in the pattern and check if the msg matches
        -- Supported pattern types:
        --   - Exact string match
        --   - Lua gmatch string
        --   - '_' (wildcard: Message has tag, but can be any value)
        --   - Function execution on the tag, optionally using the msg as the second argument
        --   - Table of patterns, where ANY of the sub-patterns matching the tag will result in a match
        end
        if type(spec) == 'table' then
            for key, pattern in pairs(spec) do
                if not utils.matchesPattern(pattern, msg[key], msg) then
                    return false
                end
            end
            return true
        end
        if type(spec) == 'string' and msg.Action == spec then
            return true
        end
        return false
    end

    local function isArray(table)
        if type(table) == "table" then
            local maxIndex = 0
            for k, v in pairs(table) do
                if type(k) ~= "number" or k < 1 or math.floor(k) ~= k then
                    return false -- If there's a non-integer key, it's not an array
                end
                maxIndex = math.max(maxIndex, k)
            end
            -- If the highest numeric index is equal to the number of elements, it's an array
            return maxIndex == #table
        end
        return false
    end

    -- @param {function} fn
    -- @param {number} arity
    utils.curry = function (fn, arity)
        assert(type(fn) == "function", "function is required as first argument")
        arity = arity or debug.getinfo(fn, "u").nparams
        if arity < 2 then return fn end
    
        return function (...)
            local args = {...}
        
            if #args >= arity then
                return fn(table.unpack(args))
            else
                return utils.curry(function (...)
                    return fn(table.unpack(args),  ...)
                end, arity - #args)
            end
        end
    end

    --- Concat two Array Tables.
    -- @param {table<Array>} a
    -- @param {table<Array>} b
    utils.concat = utils.curry(function (a, b)
        assert(type(a) == "table", "first argument should be a table that is an array")
        assert(type(b) == "table", "second argument should be a table that is an array")
        assert(isArray(a), "first argument should be a table")
        assert(isArray(b), "second argument should be a table")
    
        local result = {}
        for i = 1, #a do
            result[#result + 1] = a[i]
        end
        for i = 1, #b do
            result[#result + 1] = b[i]
        end
        return result
    end, 2)

    --- reduce applies a function to a table
    -- @param {function} fn
    -- @param {any} initial
    -- @param {table<Array>} t
    utils.reduce = utils.curry(function (fn, initial, t)
        assert(type(fn) == "function", "first argument should be a function that accepts (result, value, key)")
        assert(type(t) == "table" and isArray(t), "third argument should be a table that is an array")
        local result = initial
        for k, v in pairs(t) do
            if result == nil then
                result = v
            else
                result = fn(result, v, k)
            end
        end
        return result
    end, 3)

    -- @param {function} fn
    -- @param {table<Array>} data
    utils.map = utils.curry(function (fn, data)
        assert(type(fn) == "function", "first argument should be a unary function")
        assert(type(data) == "table" and isArray(data), "second argument should be an Array")
    
        local function map (result, v, k)
            result[k] = fn(v, k)
            return result
        end
    
        return utils.reduce(map, {}, data)
    end, 2)

    -- @param {function} fn
    -- @param {table<Array>} data
    utils.filter = utils.curry(function (fn, data)
        assert(type(fn) == "function", "first argument should be a unary function")
        assert(type(data) == "table" and isArray(data), "second argument should be an Array")
    
        local function filter (result, v, _k)
            if fn(v) then
                table.insert(result, v)
            end
            return result
        end
    
        return utils.reduce(filter,{}, data)
    end, 2)

    -- @param {function} fn
    -- @param {table<Array>} t
    utils.find = utils.curry(function (fn, t)
        assert(type(fn) == "function", "first argument should be a unary function")
        assert(type(t) == "table", "second argument should be a table that is an array")
        for _, v in pairs(t) do
            if fn(v) then
                return v
            end
        end
    end, 2)

    -- @param {string} propName
    -- @param {string} value 
    -- @param {table} object
    utils.propEq = utils.curry(function (propName, value, object)
        assert(type(propName) == "string", "first argument should be a string")
        -- assert(type(value) == "string", "second argument should be a string")
        assert(type(object) == "table", "third argument should be a table<object>")
        
        return object[propName] == value
    end, 3)

    -- @param {table<Array>} data
    utils.reverse = function (data)
        assert(type(data) == "table", "argument needs to be a table that is an array")
        return utils.reduce(
            function (result, v, i)
                result[#data - i + 1] = v
                return result
            end,
            {},
            data
        )
    end

    -- @param {function} ... 
    utils.compose = utils.curry(function (...)
        local mutations = utils.reverse({...})
    
        return function (v)
            local result = v
            for _, fn in pairs(mutations) do
                assert(type(fn) == "function", "each argument needs to be a function")
                result = fn(result)
            end
            return result
        end
    end, 2)

    -- @param {string} propName
    -- @param {table} object
    utils.prop = utils.curry(function (propName, object) 
        return object[propName]
    end, 2)

    -- @param {any} val
    -- @param {table<Array>} t
    utils.includes = utils.curry(function (val, t)
        assert(type(t) == "table", "argument needs to be a table")
        return utils.find(function (v) return v == val end, t) ~= nil
    end, 2)

    -- @param {table} t
    utils.keys = function (t)
        assert(type(t) == "table", "argument needs to be a table")
        local keys = {}
        for key in pairs(t) do
            table.insert(keys, key)
        end
        return keys
    end

    -- @param {table} t
    utils.values = function (t)
        assert(type(t) == "table", "argument needs to be a table")
        local values = {}
        for _, value in pairs(t) do
            table.insert(values, value)
        end
        return values
    end

    return utils
end

_G.package.loaded[".utils"] = load_utils()
-- print("loaded utils")
    
local function load_assignment() 
    local Assignment = { _version = "0.1.0" }
    local utils = require('.utils')

    function Assignment.init(ao)
        local function findIndexByProp(array, prop, value)
            for index, object in ipairs(array) do
                if object[prop] == value then return index end
            end
            return nil
        end

        ao.assignables = ao.assignables or {}

        -- Add the MatchSpec to the ao.assignables table. A optional name may be provided.
        -- This implies that ao.assignables may have both number and string indices.
        --
        -- @tparam ?string|number|any nameOrMatchSpec The name of the MatchSpec
        --        to be added to ao.assignables. If a MatchSpec is provided, then
        --        no name is included
        -- @tparam ?any matchSpec The MatchSpec to be added to ao.assignables. Only provided
        --        if its name is passed as the first parameter
        -- @treturn ?string|number name The name of the MatchSpec, either as provided
        --          as an argument or as incremented
        ao.addAssignable = ao.addAssignable or function(...)
            local name = nil
            local matchSpec = nil
            local idx = nil

            -- Initialize the parameters based on arguments
            if select("#", ...) == 1 then
                matchSpec = select(1, ...)
            else
                name = select(1, ...)
                matchSpec = select(2, ...)
                assert(type(name) == 'string', 'MatchSpec name MUST be a string')
            end

            if name then idx = findIndexByProp(ao.assignables, "name", name) end

            if idx ~= nil and idx > 0 then
                -- found update
                ao.assignables[idx].pattern = matchSpec
            else
                -- append the new assignable, including potentially nil name
                table.insert(ao.assignables, { pattern = matchSpec, name = name })
            end
        end

        -- Remove the MatchSpec, either by name or by index
        -- If the name is not found, or if the index does not exist, then do nothing.
        --
        -- @tparam string|number name The name or index of the MatchSpec to be removed
        -- @treturn nil nil
        ao.removeAssignable = ao.removeAssignable or function(name)
            local idx = nil

            if type(name) == 'string' then
                idx = findIndexByProp(ao.assignables, "name", name)
            else
                assert(type(name) == 'number', 'index MUST be a number')
                idx = name
            end

            if idx == nil or idx <= 0 or idx > #ao.assignables then return end

            table.remove(ao.assignables, idx)
        end

        -- Return whether the msg is an assignment or not. This
        -- can be determined by simply checking whether the msg's Target is
        -- This process' id
        --
        -- @param msg The msg to be checked
        -- @treturn boolean isAssignment
        ao.isAssignment = ao.isAssignment or function(msg)
            return msg.Target ~= ao.id
        end

        -- Check whether the msg matches any assignable MatchSpec.
        -- If no assignables are configured, the msg is deemed not assignable, by default.
        --
        -- @param msg The msg to be checked
        -- @treturn boolean isAssignable
        ao.isAssignable = ao.isAssignable or function(msg)
            for _, assignable in pairs(ao.assignables) do
                if utils.matchesSpec(msg, assignable.pattern) then return true end
            end

            -- If assignables is empty, the above loop will noop,
            -- and this expression will execute.
            --
            -- In other words, all msgs are not assignable, by default.
            return false
        end
    end

    return Assignment
end
_G.package.loaded[".assignment"] = load_assignment()
-- print("loaded assignment")  

  
  
  local function load_handlers() 
  local handlers = { _version = "0.0.5" }
  local coroutine = require('coroutine')
  local utils = require('.utils')
  
  handlers.utils = require('.handlers-utils')
  -- if update we need to keep defined handlers
  if Handlers then
    handlers.list = Handlers.list or {}
    handlers.coroutines = Handlers.coroutines or {}
  else
    handlers.list = {}
    handlers.coroutines = {}
  
  end
  handlers.onceNonce = 0
  
  
  local function findIndexByProp(array, prop, value)
    for index, object in ipairs(array) do
      if object[prop] == value then
        return index
      end
    end
    return nil
  end
  
  local function assertAddArgs(name, pattern, handle, maxRuns)
    assert(
      type(name) == 'string' and
      (type(pattern) == 'function' or type(pattern) == 'table' or type(pattern) == 'string'),
      'Invalid arguments given. Expected: \n' ..
      '\tname : string, ' ..
      '\tpattern : Action : string | MsgMatch : table,\n' ..
      '\t\tfunction(msg: Message) : {-1 = break, 0 = skip, 1 = continue},\n' ..
      '\thandle(msg : Message) : void) | Resolver,\n' ..
      '\tMaxRuns? : number | "inf" | nil')
  end
  
  function handlers.generateResolver(resolveSpec)
    return function(msg)
      -- If the resolver is a single function, call it.
      -- Else, find the first matching pattern (by its matchSpec), and exec.
      if type(resolveSpec) == "function" then
        return resolveSpec(msg)
      else
          for matchSpec, func in pairs(resolveSpec) do
              if utils.matchesSpec(msg, matchSpec) then
                  return func(msg)
              end
          end
      end
    end
  end
  
  -- Returns the next message that matches the pattern
  -- This function uses Lua's coroutines under-the-hood to add a handler, pause,
  -- and then resume the current coroutine. This allows us to effectively block
  -- processing of one message until another is received that matches the pattern.
  function handlers.receive(pattern)
    local self = coroutine.running()
    handlers.once(pattern, function (msg)
        coroutine.resume(self, msg)
    end)
    return coroutine.yield(pattern)
  end
  
  function handlers.once(...)
    local name, pattern, handle
    if select("#", ...) == 3 then
      name = select(1, ...)
      pattern = select(2, ...)
      handle = select(3, ...)
    else
      name = "_once_" .. tostring(handlers.onceNonce)
      handlers.onceNonce = handlers.onceNonce + 1
      pattern = select(1, ...)
      handle = select(2, ...)
    end
    handlers.add(name, pattern, handle, 1)
  end
  
  function handlers.add(name, pattern, handle, maxRuns)
    assertAddArgs(name, pattern, handle, maxRuns)
    
    handle = handlers.generateResolver(handle)
    
    -- update existing handler by name
    local idx = findIndexByProp(handlers.list, "name", name)
    if idx ~= nil and idx > 0 then
      -- found update
      handlers.list[idx].pattern = pattern
      handlers.list[idx].handle = handle
      handlers.list[idx].maxRuns = maxRuns
    else
      -- not found then add    
      table.insert(handlers.list, { pattern = pattern, handle = handle, name = name, maxRuns = maxRuns })
  
    end
    return #handlers.list
  end
  
  function handlers.append(name, pattern, handle, maxRuns)
    assertAddArgs(name, pattern, handle, maxRuns)
    
    handle = handlers.generateResolver(handle)
    -- update existing handler by name
    local idx = findIndexByProp(handlers.list, "name", name)
    if idx ~= nil and idx > 0 then
      -- found update
      handlers.list[idx].pattern = pattern
      handlers.list[idx].handle = handle
      handlers.list[idx].maxRuns = maxRuns
    else
      
      table.insert(handlers.list, { pattern = pattern, handle = handle, name = name, maxRuns = maxRuns })
    end
  
    
  end
  
  function handlers.prepend(name, pattern, handle, maxRuns)
    assertAddArgs(name, pattern, handle, maxRuns)
  
    handle = handlers.generateResolver(handle)
  
    -- update existing handler by name
    local idx = findIndexByProp(handlers.list, "name", name)
    if idx ~= nil and idx > 0 then
      -- found update
      handlers.list[idx].pattern = pattern
      handlers.list[idx].handle = handle
      handlers.list[idx].maxRuns = maxRuns
    else  
      table.insert(handlers.list, 1, { pattern = pattern, handle = handle, name = name, maxRuns = maxRuns })
    end
  
    
  end
  
  function handlers.before(handleName)
    assert(type(handleName) == 'string', 'Handler name MUST be a string')
  
    local idx = findIndexByProp(handlers.list, "name", handleName)
    return {
      add = function (name, pattern, handle, maxRuns) 
        assertAddArgs(name, pattern, handle, maxRuns)
        
        handle = handlers.generateResolver(handle)
        
        if idx then
          table.insert(handlers.list, idx, { pattern = pattern, handle = handle, name = name, maxRuns = maxRuns })
        end
        
      end
    }
  end
  
  function handlers.after(handleName)
    assert(type(handleName) == 'string', 'Handler name MUST be a string')
    local idx = findIndexByProp(handlers.list, "name", handleName)
    return {
      add = function (name, pattern, handle, maxRuns)
        assertAddArgs(name, pattern, handle, maxRuns)
        
        handle = handlers.generateResolver(handle)
        
        if idx then
          table.insert(handlers.list, idx + 1, { pattern = pattern, handle = handle, name = name, maxRuns = maxRuns })
        end
        
      end
    }
  
  end
  
  function handlers.remove(name)
    assert(type(name) == 'string', 'name MUST be string')
    if #handlers.list == 1 and handlers.list[1].name == name then
      handlers.list = {}
      
    end
  
    local idx = findIndexByProp(handlers.list, "name", name)
    table.remove(handlers.list, idx)
    
  end
  
  --- return 0 to not call handler, -1 to break after handler is called, 1 to continue
  function handlers.evaluate(msg, env)
    local handled = false
    assert(type(msg) == 'table', 'msg is not valid')
    assert(type(env) == 'table', 'env is not valid')
    
    for _, o in ipairs(handlers.list) do
      if o.name ~= "_default" then
        local match = utils.matchesSpec(msg, o.pattern)
        if not (type(match) == 'number' or type(match) == 'string' or type(match) == 'boolean') then
          error("Pattern result is not valid, it MUST be string, number, or boolean")
        end
        
        -- handle boolean returns
        if type(match) == "boolean" and match == true then
          match = -1
        elseif type(match) == "boolean" and match == false then
          match = 0
        end
  
        -- handle string returns
        if type(match) == "string" then
          if match == "continue" then
            match = 1
          elseif match == "break" then
            match = -1
          else
            match = 0
          end
        end
  
        if match ~= 0 then
          if match < 0 then
            handled = true
          end
          -- each handle function can accept, the msg, env
          local status, err = pcall(o.handle, msg, env)
          if not status then
            error(err)
          end
          -- remove handler if maxRuns is reached. maxRuns can be either a number or "inf"
          if o.maxRuns ~= nil and o.maxRuns ~= "inf" then
            o.maxRuns = o.maxRuns - 1
            if o.maxRuns == 0 then
              handlers.remove(o.name)
            end
          end
        end
        if match < 0 then
          return handled
        end
      end
    end
    -- do default
    if not handled then
      local idx = findIndexByProp(handlers.list, "name", "_default")
      handlers.list[idx].handle(msg,env)
    end
  end
  
  return handlers
  end
  _G.package.loaded[".handlers"] = load_handlers()
  -- print("loaded handlers")
    
  
  
  local function load_eval() 
    local stringify = require(".stringify")
    -- handler for eval
    return function (ao)
        return function (msg)
        -- exec expression
        local expr = msg.Data
        local func, err = load("return " .. expr, 'aos', 't', _G)
        local output = ""
        local e = nil
        if err then
            func, err = load(expr, 'aos', 't', _G)
        end
        if func then
            output, e = func()
        else
            ao.outbox.Error = err
            return
        end
        if e then 
            ao.outbox.Error = e
            return 
        end
        if HANDLER_PRINT_LOGS then
            table.insert(HANDLER_PRINT_LOGS, type(output) == "table" and stringify.format(output) or output)
        else 
            -- set result in outbox.Output (Left for backwards compatibility)
            ao.outbox.Output = {  
            json = type(output) == "table" and pcall(function () return json.encode(output) end) and output or "undefined",
            data = type(output) == "table" and stringify.format(output) or output, 
            prompt = Prompt() 
            }
    
        end
        end 
    end
  
  end
  _G.package.loaded[".eval"] = load_eval()
  -- print("loaded eval")
    
  
  
  local function load_process() 
  local pretty = require('.pretty')
  local base64 = require('.base64')
  local json = require('json')
  local chance = require('.chance')
  local crypto = require('.crypto.init')
  local coroutine = require('coroutine')
  
  Colors = {
    red = "\27[31m",
    green = "\27[32m",
    blue = "\27[34m",
    reset = "\27[0m",
    gray = "\27[90m"
  }
  
  Bell = "\x07"
  
  Dump = require('.dump')
  Utils = require('.utils')
  Handlers = require('.handlers')
  local stringify = require(".stringify")
  local assignment = require('.assignment')
  local _ao = require('ao')
  
  -- Implement assignable polyfills on _ao
  assignment.init(_ao)
  
  local process = { _version = "0.2.2.rc1" }
  local maxInboxCount = 10000
  
  -- wrap ao.send and ao.spawn for magic table
  local aosend = _ao.send 
  local aospawn = _ao.spawn
  _ao.send = function (msg)
    if msg.Data and type(msg.Data) == 'table' then
      msg['Content-Type'] = 'application/json'
      msg.Data = require('json').encode(msg.Data)
    end
    return aosend(msg)
  end
  _ao.spawn = function (module, msg) 
    if msg.Data and type(msg.Data) == 'table' then
      msg['Content-Type'] = 'application/json'
      msg.Data = require('json').encode(msg.Data)
    end
    return aospawn(module, msg)
  end
  
  local function removeLastThreeLines(input)
    local lines = {}
    for line in input:gmatch("([^\n]*)\n?") do
        table.insert(lines, line)
    end
  
    -- Remove the last three lines
    for i = 1, 3 do
        table.remove(lines)
    end
  
    -- Concatenate the remaining lines
    return table.concat(lines, "\n")
  end
  
  
  local function insertInbox(msg)
    table.insert(Inbox, msg)
    if #Inbox > maxInboxCount then
      local overflow = #Inbox - maxInboxCount 
      for i = 1,overflow do
        table.remove(Inbox, 1)
      end
    end 
  end
  
  local function findObject(array, key, value)
    for i, object in ipairs(array) do
      if object[key] == value then
        return object
      end
    end
    return nil
  end
  
  function Tab(msg)
    local inputs = {}
    for _, o in ipairs(msg.Tags) do
      if not inputs[o.name] then
        inputs[o.name] = o.value
      end
    end
    return inputs
  end
  
  function Prompt()
    return Colors.green .. Name .. Colors.gray
      .. "@" .. Colors.blue .. "aos-" .. process._version .. Colors.gray
      .. "[Inbox:" .. Colors.red .. tostring(#Inbox) .. Colors.gray
      .. "]" .. Colors.reset .. "> "
  end
  
  function print(a)
    if type(a) == "table" then
      a = stringify.format(a)
    end
    
    local data = a
    if _ao.outbox.Output.data then
      data =  _ao.outbox.Output.data .. "\n" .. a
    end
    _ao.outbox.Output = { data = data, prompt = Prompt(), print = true }
  
    -- Only supported for newer version of AOS
    if HANDLER_PRINT_LOGS then 
      table.insert(HANDLER_PRINT_LOGS, a)
      return nil
    end
  
    return tostring(a)
  end
  
  function Send(msg)
    if not msg.Target then
      print("WARN: No target specified for message. Data will be stored, but no process will receive it.")
    end
    local result = _ao.send(msg)
    return {
      output = "Message added to outbox",
      receive = result.receive,
      onReply = result.onReply
    }
  end
  
  function Spawn(...)
    local module, spawnMsg
  
    if select("#", ...) == 1 then
      spawnMsg = select(1, ...)
      module = _ao._module
    else
      module = select(1, ...)
      spawnMsg = select(2, ...)
    end
  
    if not spawnMsg then
      spawnMsg = {}
    end
    local result = _ao.spawn(module, spawnMsg)
    return {
      output = "Spawn process request added to outbox",
      after = result.after,
      receive = result.receive
    }  
  end
  
  function Receive(match)
    return Handlers.receive(match)
  end
  
  function Assign(assignment)
    if not _ao.assign then
      print("Assign is not implemented.")
      return "Assign is not implemented."
    end
    _ao.assign(assignment)
    print("Assignment added to outbox.")
    return 'Assignment added to outbox.'
  end
  
  Seeded = Seeded or false
  
  -- this is a temporary approach...
  local function stringToSeed(s)
    local seed = 0
    for i = 1, #s do
        local char = string.byte(s, i)
        seed = seed + char
    end
    return seed
  end
  
  local function initializeState(msg, env)
    if not Seeded then
      --math.randomseed(1234)
      chance.seed(tonumber(msg['Block-Height'] .. stringToSeed(msg.Owner .. msg.Module .. msg.Id)))
      math.random = function (...)
        local args = {...}
        local n = #args
        if n == 0 then
          return chance.random()
        end
        if n == 1 then
          return chance.integer(1, args[1])
        end
        if n == 2 then
          return chance.integer(args[1], args[2])
        end
        return chance.random()
      end
      Seeded = true
    end
    Errors = Errors or {}
    Inbox = Inbox or {}
  
    -- temporary fix for Spawn
    if not Owner then
      local _from = findObject(env.Process.Tags, "name", "From-Process")
      if _from then
        Owner = _from.value
      else
        Owner = msg.From
      end
    end
  
    if not Name then
      local aosName = findObject(env.Process.Tags, "name", "Name")
      if aosName then
        Name = aosName.value
      else
        Name = 'aos'
      end
    end
  
  end
  
  function Version()
    print("version: " .. process._version)
  end
  
  function process.handle(msg, ao)
    ao.id = ao.env.Process.Id
    initializeState(msg, ao.env)
    HANDLER_PRINT_LOGS = {}
    
    -- set os.time to return msg.Timestamp
    os.time = function () return msg.Timestamp end
  
    -- tagify msg
    msg.TagArray = msg.Tags
    msg.Tags = Tab(msg)
    -- tagify Process
    ao.env.Process.TagArray = ao.env.Process.Tags
    ao.env.Process.Tags = Tab(ao.env.Process)
    -- magic table - if Content-Type == application/json - decode msg.Data to a Table
    if msg.Tags['Content-Type'] and msg.Tags['Content-Type'] == 'application/json' then
      msg.Data = require('json').decode(msg.Data or "{}")
    end
    -- init Errors
    Errors = Errors or {}
    -- clear Outbox
    ao.clearOutbox()
  
    -- Only trust messages from a signed owner or an Authority
    if msg.From ~= msg.Owner and not ao.isTrusted(msg) then
      Send({Target = msg.From, Data = "Message is not trusted by this process!"})
      print('Message is not trusted! From: ' .. msg.From .. ' - Owner: ' .. msg.Owner)
      return ao.result({ }) 
    end
  
    if ao.isAssignment(msg) and not ao.isAssignable(msg) then
      Send({Target = msg.From, Data = "Assignment is not trusted by this process!"})
      print('Assignment is not trusted! From: ' .. msg.From .. ' - Owner: ' .. msg.Owner)
      return ao.result({ })
    end
  
    Handlers.add("_eval",
      function (msg)
        return msg.Action == "Eval" and Owner == msg.From
      end,
      require('.eval')(ao)
    )
    Handlers.append("_default", function () return true end, require('.default')(insertInbox))
    -- call evaluate from handlers passing env
    msg.reply =
      function(replyMsg)
        replyMsg.Target = msg["Reply-To"] or (replyMsg.Target or msg.From)
        replyMsg["X-Reference"] = msg["X-Reference"] or msg.Reference
        replyMsg["X-Origin"] = msg["X-Origin"] or nil
  
        return ao.send(replyMsg)
      end
    
    msg.forward =
      function(target, forwardMsg)
        -- Clone the message and add forwardMsg tags
        local newMsg =  ao.sanitize(msg)
        forwardMsg = forwardMsg or {}
  
        for k,v in pairs(forwardMsg) do
          newMsg[k] = v
        end
  
        -- Set forward-specific tags
        newMsg.Target = target
        newMsg["Reply-To"] = msg["Reply-To"] or msg.From
        newMsg["X-Reference"] = msg["X-Reference"] or msg.Reference
        newMsg["X-Origin"] = msg["X-Origin"] or msg.From
  
        ao.send(newMsg)
      end
  
    local co = coroutine.create(
      function()
        return pcall(Handlers.evaluate, msg, ao.env)
      end
    )
    local _, status, result = coroutine.resume(co)
  
    -- Make sure we have a reference to the coroutine if it will wake up.
    -- Simultaneously, prune any dead coroutines so that they can be
    -- freed by the garbage collector.
    table.insert(Handlers.coroutines, co)
    for i, x in ipairs(Handlers.coroutines) do
      if coroutine.status(x) == "dead" then
        table.remove(Handlers.coroutines, i)
      end
    end
  
    if not status then
      if (msg.Action == "Eval") then
        table.insert(Errors, result)
        return { Error = result }
      end 
      --table.insert(Errors, result)
      --ao.outbox.Output.data = ""
      if msg.Action then
        print(Colors.red .. "Error" .. Colors.gray .. " handling message with Action = " .. msg.Action  .. Colors.reset)
      else
        print(Colors.red .. "Error" .. Colors.gray .. " handling message " .. Colors.reset)
      end
      print(Colors.green .. result .. Colors.reset)
      print("\n" .. Colors.gray .. removeLastThreeLines(debug.traceback()) .. Colors.reset)
      return ao.result({ Messages = {}, Spawns = {}, Assignments = {} })
    end
  
    
  
    collectgarbage('collect')
    if msg.Action == "Eval" then
      local response = ao.result({ 
        Output = {
          data = table.concat(HANDLER_PRINT_LOGS, "\n"),
          prompt = Prompt(),
          test = Dump(HANDLER_PRINT_LOGS)
        }
      })
      HANDLER_PRINT_LOGS = {} -- clear logs
      return response
    else
      local response = ao.result({ Output = { data = table.concat(HANDLER_PRINT_LOGS, "\n"), prompt = Prompt(), print = true } })
      HANDLER_PRINT_LOGS = {} -- clear logs
      return response
    end
  end
  
  return process
  
  end
  _G.package.loaded[".process"] = load_process()
  -- print("loaded process")
    
  
  
    local AO_TESTNET = 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY'
    local SEC_PATCH = 'sec-patch-6-5-2024'
    
    if not Utils.includes(AO_TESTNET, ao.authorities) then
      table.insert(ao.authorities, AO_TESTNET)
    end
    if not Utils.includes(SEC_PATCH, Utils.map(Utils.prop('name'), Handlers.list)) then
      Handlers.prepend(SEC_PATCH, 
        function (msg)
          return msg.From ~= msg.Owner and not ao.isTrusted(msg)
        end,
        function (msg)
          Send({Target = msg.From, Data = "Message is not trusted."})
          print("Message is not trusted. From: " .. msg.From .. " - Owner: " .. msg.Owner)
        end
      )
    end
    -- print("Added Patch Handler")
    
  
  
  Handlers.prepend("Assignment-Check", 
    function (msg)
        return ao.isAssignment(msg) and not ao.isAssignable(msg)
    end, 
    function (msg) 
        Send({Target = msg.From, Data = "Assignment is not trusted by this process!"})
        print('Assignment is not trusted! From: ' .. msg.From .. ' - Owner: ' .. msg.Owner)
    end
  )
  
  print([[Updated AOS to version ]] .. require('.process')._version)
  