
var assert = require('chai').assert;
var expect = require("chai").expect;
var request = require('request');

describe('Bookmark', () => {
    describe('Send Bookmark', () => {
        var url = 'http://localhost:3175?url='
            + encodeURIComponent("http://mp.weixin.qq.com/s?__biz=MzAxNjQwNDY0MQ==&mid=403997163&idx=1&sn=d0e303ad9a927f398bacbec8e6c4e3a6")
            + '&title='
            + encodeURIComponent("JavaScript全讲");
        it("returns status 200", function() {
            request(url, (err, response, body) => {
                expect(response.statusCode).to.equal(200);
                //console.dir(body);
                done();
            });
        });
    });
});