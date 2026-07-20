# BeamShock

An [OpenShock](https://github.com/OpenShock) integration that encourages you to be a more careful driver by providing "shocking" feedback if you get in an accident.

## Installation

- Ensure you have Python 3 installed
- Copy the `/beamshock` directory into your [mod folder's](https://documentation.beamng.com/tutorials/mods/installing-mods/#manual-installation) `/unpacked` directory.
- (Optional) Select the mod in BeamNG's mod manager and pack the mod.
- Install Python dependancies and start the bridge by running `start_bridge.sh` (Linux) or `start_bridge.bat` (Windows)

### Notes for serial mode

- Serial mode allows you to commicate with your hub directly with minimal overhead.
- Your hub must be directly connected to the host machine.
- Currently, this has only been tested on Linux.
- You may need to add yourself to the `dialout` group to r/w to serial.
- The RF ID can be found in the edit menu of your shocker on the web app.

## Configuration

* BeamShock is configurable through an in-game [UI app](https://www.beamng.com/game/support/portal/gameplay/user-interface/). 

## Q&A

### Why is a bridge required to use BeamShock?

The sandboxed Lua environment BeamNG provides isn't exactly intended for this kind of mod. The bridge is used to send encrypted web requests to OpenShock's API, or serial messages directly to your hub.
