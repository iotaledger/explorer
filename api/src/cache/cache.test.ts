/* eslint-disable max-classes-per-file */
import { LruCache } from "./cache";

class StringCache extends LruCache<string> { }
class NumberCache extends LruCache<number> { }

it("should build a new typed string", () => {
    const theCache = new StringCache(5);
    expect(theCache.capacity).toBe(5);

    expect(theCache.size).toBe(0);
    theCache.put("a", "the value");
    expect(theCache.size).toBe(1);

    const node = theCache.get("a");
    expect(typeof node).toBe("string");
    expect(node).toBe("the value");

    theCache.put("a", "another value");
    expect(theCache.size).toBe(1);
    const updatedNode = theCache.get("a");
    expect(typeof updatedNode).toBe("string");
    expect(updatedNode).toBe("another value");
});

it("should preserve lru ordering", () => {
    const theCache = new NumberCache(5);
    expect(theCache.capacity).toBe(5);
    expect(theCache.size).toBe(0);

    theCache.put("1", 1);
    theCache.put("2", 2);
    theCache.put("3", 3);
    theCache.put("4", 4);
    theCache.put("5", 5);

    expect(theCache.size).toBe(5);
    expect(theCache.view()).toBe(JSON.stringify([["5", 5], ["4", 4], ["3", 3], ["2", 2], ["1", 1]]));

    theCache.get("1");
    expect(theCache.size).toBe(5);
    expect(theCache.view()).toBe(JSON.stringify([["1", 1], ["5", 5], ["4", 4], ["3", 3], ["2", 2]]));

    theCache.put("6", 6);
    expect(theCache.size).toBe(5);
    expect(theCache.view()).toBe(JSON.stringify([["6", 6], ["1", 1], ["5", 5], ["4", 4], ["3", 3]]));

    const evictedTwo = theCache.get("2");
    expect(evictedTwo).toBe(null);

    theCache.put("1", 1);
    expect(theCache.size).toBe(5);
    expect(theCache.view()).toBe(JSON.stringify([["1", 1], ["6", 6], ["5", 5], ["4", 4], ["3", 3]]));

    theCache.get("3");
    theCache.put("2", 2);
    theCache.get("5");
    theCache.get("5");
    theCache.get("5");
    theCache.get("5");
    theCache.put("2", 2);
    theCache.put("2", 2);
    theCache.put("2", 2);
    theCache.put("2", 2);

    expect(theCache.size).toBe(5);
    expect(theCache.view()).toBe(JSON.stringify([["2", 2], ["5", 5], ["3", 3], ["1", 1], ["6", 6]]));
});

