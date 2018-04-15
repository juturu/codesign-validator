export type Deferred<T> = {
    promise: Promise<T>,
    resolve: (value?: T) => void,
    reject: (error?: Error) => void
};

export function defer<T>(): Deferred<T> {
    let deferred = {} as Deferred<T>;
    // tslint:disable-next-line: promise-must-complete
    deferred.promise = new Promise<T>((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}
