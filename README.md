# BeamShock

An [OpenShock](https://github.com/OpenShock) integration that encourages you to be a more careful driver by providing "shocking" feedback if you get in an accident.

## Installation

- Ensure you have Python 3 installed
- Copy the `/beamshock` directory into your [mod folder's](https://documentation.beamng.com/tutorials/mods/installing-mods/#manual-installation) `/unpacked` directory.
- (Optional) Select the mod in BeamNG's mod manager and pack the mod.
- Install Python dependancies and start the bridge by running `start_bridge.sh` (Linux) or `start_bridge.bat` (Windows)

## Configuration

* BeamShock is configurable through an in-game [UI app](https://www.beamng.com/game/support/portal/gameplay/user-interface/). 

## Q&A

### Why is a bridge required to use BeamShock?

The Lua environment in BeamNG only seems to allow requests over plain HTTP. The bridge is used to send an encrypted request to OpenShock's API.

