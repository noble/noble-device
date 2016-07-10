## Version 1.4

 * Add battery level notification support ([@Lahorde ](https://github.com/Lahorde ))
 * Add ```subscribeCharacteristic``` and ```unsubscribeCharacteristic```
 * Add ```readInt8Characteristic```, ```writeInt8Characteristic```, ```readInt16LECharacteristic```, ```writeInt16LECharacteristic```, ```readInt32LECharacteristic```, and ```writeInt32LECharacteristic```
 * Add ```hasService``` and ```hasCharacteristic```
 * Use noble ```^1.6.0```

## Version 1.3

 * Remove duplicated ```writeUInt8Characteristic``` function ([@hotchpotch](https://github.com/hotchpotch))
 * Add heart rate measument service ([@hotchpotch](https://github.com/hotchpotch))
 * New ```examples``` folder for examples

## Version 1.2

 * new ```stopDiscover``` API
 * new ```discoverByAddress``` API

## Version 1.1

 * new ```discoverById``` API, ```discoverByUuid``` is deprecated now
 * ```.id``` property, ```.uuid``` is deprecated now
 * noble dependency is now ```^1.1.0```
 * new ```discoverByAddress``` API
 * ```.address``` and ```.addressType``` properties

## Version 1.0.3

 * correct missing error parameter in ```readUInt32LECharacteristic```

## Version 1.0.2

 * backwards compatibility fix for node 0.8 ([@brucealdridge](https://github.com/brucealdridge))
 * re-work scanning logic to handle state changes
 * use noble 1.0.0

## Version 1.0.1

 * add ``connectedAndSetUp`` property

## Version 1.0

 * add error parameters to callbacks
 * ```connectAndSetup``` renamed to ```connectAndSetUp```

## Older

 * Changes not recorded

