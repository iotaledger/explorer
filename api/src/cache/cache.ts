/* eslint-disable max-classes-per-file */
class CacheNode<T> {
    public key: string;

    public val: T;

    public prev: CacheNode<T> | null;

    public next: CacheNode<T> | null;

    constructor(key: string, val: T) {
        this.key = key;
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

export abstract class LruCache<T> {
    private readonly cacheMaxSize: number;

    private cacheSize: number = 0;

    private head: CacheNode<T>;

    private tail: CacheNode<T>;

    private readonly cache: Map<string, CacheNode<T>>;

    constructor(capacity: number) {
        this.cache = new Map<string, CacheNode<T>>();
        this.cacheMaxSize = capacity;
    }

    public get size() {
        return this.cacheSize;
    }

    public get capacity() {
        return this.cacheMaxSize;
    }

    public get(key: string): T | null {
        if (!this.cache.has(key)) {
            return null;
        }

        const node = this.cache.get(key);
        this.use(key);

        return node.val;
    }

    public insert(key: string, val: T) {
        const node = new CacheNode<T>(key, val);
        this.cacheSize++;
        this.cache.set(key, node);

        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            this.head.prev = node;
            node.next = this.head;
            this.head = node;
        }
    }

    public put(key: string, val: T) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.val = val;
            this.use(key);
            this.cache.set(key, node);
        } else {
            if (this.cacheSize >= this.cacheMaxSize) {
                this.evict();
            }

            this.insert(key, val);
        }
    }

    public view(): string {
        let current = this.head;
        const cacheView: [string, T][] = [];

        while (current) {
            cacheView.push([current.key, current.val]);
            current = current.next;
        }

        return JSON.stringify(cacheView);
    }

    private use(key: string) {
        const node: CacheNode<T> = this.cache.get(key);

        if (node === this.head) {
            // do nothing
        } else if (node === this.tail) {
            node.prev.next = null;
            this.tail = node.prev;
            node.prev = null;
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        } else {
            if (node.prev) {
                node.prev.next = node.next;
            }
            if (node.next) {
                node.next.prev = node.prev;
            }
            node.next = this.head;
            node.prev = null;
            this.head.prev = node;
            this.head = node;
        }
    }

    private evict() {
        const keyToEvict = this.tail ? this.tail.key : null;

        if (!this.tail) {
            return;
        } else if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail.prev.next = null;
            this.tail = this.tail.prev;
        }

        if (keyToEvict) {
            this.cacheSize--;
            this.cache.delete(keyToEvict);
        }
    }
}

