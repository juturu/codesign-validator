import test from 'ava'
import CodeSign from '../../dist/codesign-validator'
import * as path from 'path'
import * as os from 'os'

test('validate codesign fails', async t => {
  let test = new CodeSign(path.join(__dirname, `index.test.js`))
  test.check().then(() => {
    t.fail()
  }).catch(() => {
    // Error means success.
    t.pass()
  })
})

test('validate codesign succeeds', async t => {
  let test
  if (os.platform() === 'darwin') {
    test = new CodeSign(`/Applications/Utilities/Activity\\ Monitor.app`)
  } else if (os.platform() === 'win32') {
    test = new CodeSign(`c:\\windows\\system32\\kernel32.dll`)
  }
  test.check().then(() => {
    t.pass()
  }).catch(() => {
    // Error means success.
    t.fail()
  })
})
