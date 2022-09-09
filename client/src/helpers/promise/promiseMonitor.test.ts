/* eslint-disable  prefer-promise-reject-errors */
import PromiseMonitor, { PromiseStatus } from "./promiseMonitor";

const promiseSuccess = async () => new Promise<string>(resolve => {
    setTimeout(() => {
        resolve("done");
    }, 10);
});

const promiseFail = async () => new Promise<string>((_, reject) => {
    setTimeout(() => {
        reject("failed");
    }, 30);
});

const promiseError = async () => new Promise<string>(() => {
    throw new Error("This is bad.");
});

it("should report on promise statuses", async () => {
    const onStatusUpdate = jest.fn();

    const promiseMonitor = new PromiseMonitor(status => {
        onStatusUpdate(status);
    });

    const wrapperPromise1 = promiseMonitor.enqueue<string>(promiseSuccess);
    const wrapperPromise2 = promiseMonitor.enqueue<string>(promiseFail);
    const wrapperPromise3 = promiseMonitor.enqueue<string>(promiseError);

    await expect(wrapperPromise1).resolves.toBe("done");
    await expect(wrapperPromise2).rejects.toBe("failed");
    await expect(wrapperPromise3).rejects.toThrowError("This is bad.");

    expect(onStatusUpdate.mock.calls.length).toBe(4);
    expect(onStatusUpdate.mock.calls[0][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[1][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[2][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[3][0]).toBe(PromiseStatus.DONE);
});

it("should report on promise statuses properly, even if reused", async () => {
    const onStatusUpdate = jest.fn();

    const promiseMonitor = new PromiseMonitor(status => {
        onStatusUpdate(status);
    });

    const wrapperPromise1 = promiseMonitor.enqueue<string>(promiseSuccess);
    const wrapperPromise2 = promiseMonitor.enqueue<string>(promiseFail);

    await expect(wrapperPromise1).resolves.toBe("done");
    await expect(wrapperPromise2).rejects.toBe("failed");

    expect(onStatusUpdate.mock.calls.length).toBe(3);
    expect(onStatusUpdate.mock.calls[0][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[1][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[2][0]).toBe(PromiseStatus.DONE);

    const wrapperPromise3 = promiseMonitor.enqueue<string>(promiseSuccess);

    await expect(wrapperPromise3).resolves.toBe("done");

    expect(onStatusUpdate.mock.calls.length).toBe(5);
    expect(onStatusUpdate.mock.calls[0][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[1][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[2][0]).toBe(PromiseStatus.DONE);
    expect(onStatusUpdate.mock.calls[3][0]).toBe(PromiseStatus.WORKING);
    expect(onStatusUpdate.mock.calls[4][0]).toBe(PromiseStatus.DONE);
});

