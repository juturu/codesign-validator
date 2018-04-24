import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as cp from 'child_process';
import * as utility from './utility';

export default class CodeSignValidator {
    private filePath: string;
    constructor(filePath: string) {
        if (!filePath)
            throw new Error('File/Directory path should be non empty');
        this.filePath = path.resolve(filePath);
    }

    public async check() {
        let deferred = utility.defer();
        // Check if path exists,
        // fs.accessSync throws error if path doesn't exist/can't be read.
        fs.access(path.resolve(this.filePath), fs.constants.R_OK, async (err) => {
            if (!err) {
                try {
                    await this.validateSignature();
                } catch (ex) {
                    deferred.reject(err);
                }
                deferred.resolve();
            }
            else {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    }

    async validateSignature() {
        let fileExtension = this.getFileExtension();
        if (os.platform() === 'darwin') {
            await this.validateMacSignature(fileExtension);
        } else if (os.platform() === 'win32') {
            await this.validateWinSignature();
        } else {
            // Linux is not implemented.
            throw new Error('Linux is not supported');
        }
    }

    validateMacSignature(fileExtension: string) {
        let promise = utility.defer();
        let command = `spctl --assess -vv ${this.filePath} --type `;
        let validationString = `${this.filePath}: accepted`;
        switch (fileExtension) {
            case '.pkg':
            case '.dmg':
                // For PKG installer, spctl --assess --type install -vv <file_path>
                command += 'install';
                break;
            default:
                // For execute/opening file, spctl --assess --type exec -vv <file_path>
                command += 'exec';
                break;
        }
        console.log(`Executing command - ${command}`);
        let isPromiseReject: boolean = false;
        // cp.execSync(command);
        var processCodesign = cp.exec(command, (error, stdout, stderr) => {
            console.log(`command Error - ${error}`);
            if (error) {
                promise.reject(error);
            }
            console.log('stdout:' + stdout);
            console.log('stderr:' + stderr);
        });
        processCodesign.on('exit', (code: number) => {
            if (code === 0) {
                promise.resolve();
            } else if (!isPromiseReject) {
                promise.reject(new Error('Process exited with code:' + code));
            }
        });
        return promise.promise;
    }

    validateWinSignature() {
        let promise = utility.defer();
        // TODO: Improve this by using sigcheck from https://docs.microsoft.com/en-us/sysinternals/downloads/sigcheck
        let signToolPath = `c:\\Program Files (x86)\\Windows Kits\\10\\bin\\x86\\signtool.exe`;
        let command = `\"${signToolPath}\" verify \"${this.filePath}\"`;
        let validationString = `No signature found`;
        fs.access(path.resolve(signToolPath), fs.constants.R_OK, async (err) => {
            if (err) {
                promise.reject(err);
            }
            console.log(`Executing command - ${command}`);
            cp.exec(command, (error, stdout, stderr) => {
                console.log(`command output - ${error}`);
                if (error && error.toString().includes(validationString)) {
                    console.log('rejecting');
                    promise.reject(new Error('no signature'));                
                } else {
                    promise.resolve();
                }
            });
        });

        return promise.promise;
    }

    getFileExtension() {
        return this.filePath.substring(this.filePath.lastIndexOf('.'),
                                       this.filePath.length).toLowerCase();
    }
}
