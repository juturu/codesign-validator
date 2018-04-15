import test from 'ava'
import lib from '../../dist/codesign-validator'

test('it exists', async (t) => {
  let test = new lib('/Users/harij/Repos/Delete/DesktopClient/app/external/ElectronBinary/Electron.app');
  test.check().then(() => {
      console.log('test done');
      t.truthy();
  }).catch((err) => {
    t.false(err);
  })
})
