import {it as jestIt, test as jestTest} from "@jest/globals";

function it(label: string, callback: (() => void) | (() => Promise<void>)) {
	jestIt(`[IT] ${label}`, callback);
}

function test(label: string, callback: (() => void) | (() => Promise<void>)) {
	jestTest(`[TEST] ${label}`, callback);
}

it.each = jestIt.each;
it.skip = jestIt.skip;
it.only = jestIt.only;
it.todo = jestIt.todo;
it.concurrent = jestIt.concurrent;
it.failing = jestIt.failing;

test.each = jestTest.each;
test.skip = jestTest.skip;
test.only = jestTest.only;
test.todo = jestTest.todo;
test.concurrent = jestTest.concurrent;
test.failing = jestTest.failing;

global.it = it as any;
global.test = test as any;