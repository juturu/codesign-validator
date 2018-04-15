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
                await this.validateSignature();
            }
            else {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    }

    async validateSignature() {
        let fileExtension = this.getFileExtension();
        if (os.platform() == 'darwin') {
            await this.validateMacSignature(fileExtension);
        } else if (os.platform() == 'win32') {
            //await this.validateWindowsSignature(fileExtension);
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
        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                promise.reject(error);
            }
            if (stdout.lastIndexOf(validationString) > 0) {
                promise.resolve();
            } else {
                promise.reject(new Error('no signature'));
            }
        });

        return promise.promise;
    }

    validateWinSignature() {
        let promise = utility.defer();
        let command = `spctl --assess -vv ${this.filePath} --type `;
        
    }

    getFileExtension() {
        return this.filePath.substring(this.filePath.lastIndexOf('.'),
                                       this.filePath.length).toLowerCase();
    }
}
