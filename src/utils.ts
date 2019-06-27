export class Character {
    static isLetter(letter: string) {
        return /^[a-z]$/.test(letter);
    }
}

export interface HashMap<T> {
    [k: string]: T | undefined;
}

export class List<T> {
    constructor(private array: T[]) {}

    listIterator(): ListIterator<T> {
        return new ListIterator<T>(this.array);
    }
}

export class ListIterator<T> {
    private index: number = -1;

    constructor(private array: T[]) {}

    hasNext(): boolean {
        return this.index < this.array.length - 1;
    }

    next() {
        if (!this.hasNext()) throw new Error("out of bound");

        return this.array[++this.index];
    }

    nextIndex() {
        return this.index;
    }

    previous() {
        return this.array[--this.index];
    }
}
