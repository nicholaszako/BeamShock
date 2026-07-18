local M = {}

local http = require('socket.http')
local ltn12 = require('ltn12')

local config = {}

local function onUpdateConfig(config_)
  config = config_
  log('D', 'updateConfig', dumps(config))
end

local function calculateShockPercent(damage)
  local shockPercent = 0
  if damage > config.maxDamage then
    shockPercent = config.maxShock
  else
    -- % between min and max damage -> % between min and max shock
    local ratio = (damage - config.minDamage) / (config.maxDamage - config.minDamage)
    shockPercent = config.minShock + ratio * (config.maxShock - config.minShock)
  end
  shockPercent = math.floor(shockPercent)
  log('D', 'calculateShockPercent', damage .. 'J damage -> ' .. shockPercent .. '% shock')
  return shockPercent
end

local function reqShock(perc)
  local req_body = {
    com = config.comMode,
    shocks = {
      {
        id = config.api.shockerId,
        type = 'Shock',
        intensity = perc,
        duration = 300
      }
    },
    serial = {
      model = config.ser.model,
      rfId = config.ser.rfId,
      port = config.ser.port
    }
  }
  local res_body = {}
  req_body = jsonEncode(req_body)

  local req_headers = {
    ['User-Agent'] = tostring(config.api.userAgent),
    ['Content-Type'] = 'application/json',
    ['Content-Length'] = tostring(#req_body),
    ['Open-Shock-Token'] = tostring(config.api.token)
  }

  -- (r)eturn, status (c)ode, (h)eaders, (s)tatus line
  local r, c, h, s = http.request {
    method = 'POST',
    url = 'http://127.0.0.1:5858/send',
    headers = req_headers,
    source = ltn12.source.string(req_body),
    sink = ltn12.sink.table(res_body)
  }

  log('D', 'reqShock', 'Requested shock from bridge.')
  if not r then
    log('E', 'reqShock', 'No response from bridge.')
  else
    log('D', 'reqShock', 'Bridge returned status: ' .. s)
    if c ~= 200 then
      log('W', 'reqShock', 'Bridge error. See bridge logs for more details.')
    end
  end
end

local function tryShock(damage)
  if damage < config.minDamage then
    log('D', 'tryShock', 'Crash detected but ' .. damage .. ' below minimum')
  else
    local shockPercent = calculateShockPercent(damage)
    log('D', 'tryShock', 'Shock triggered! (' .. shockPercent .. '%)')
    reqShock(shockPercent, config.comMode)
  end
end

-- GE Hooks

local function onExtensionLoaded()
  log('I', 'onExtensionLoaded', 'BeamShock loaded.')
end

local function onVehicleSwitched(oldId, newId, playerId)
  -- Only detect crashes for current player vehicle
  log('D', 'onVehicleSwitched', 'Tracking new vehicle: ' .. oldId .. ' -> ' .. newId)
  gameplay_util_crashDetection.removeTrackedVehicleById(oldId)
  gameplay_util_crashDetection.addTrackedVehicleById(newId, {
    enableImpactLocationData = true,
  }, "beamshock")
end

local function onVehicleCrashEnded(data)
  if config.modEnabled then
    local damage = data.totalDamage
    log('I', 'onVehicleCrashEnded', 'Crash detected! ('  .. damage .. ' J)')
    tryShock(damage)
  end
end

-- Hook exports
M.onUpdateConfig = onUpdateConfig
M.onExtensionLoaded = onExtensionLoaded
M.onVehicleSwitched = onVehicleSwitched
M.onVehicleCrashEnded = onVehicleCrashEnded

return M