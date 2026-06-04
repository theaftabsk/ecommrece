// prebuild.js - No-op: deleteOutDir is disabled in nest-cli.json
// NestJS will overwrite dist files in place — no deletion needed.
console.log('Prebuild: skipping dist cleanup (deleteOutDir=false in nest-cli.json)');
