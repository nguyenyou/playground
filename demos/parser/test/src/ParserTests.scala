package demos.parser

import demos.parser.Parser

import utest.*

object FooTests extends TestSuite {
  def tests = Tests {
    test("case 1") {
      val result = Parser.parse("5-7")
      assert(result == Set(5, 6, 7))
      result
    }
    test("case 2") {
      val result = Parser.parse("9, 10-12")
      assert(result == Set(9, 10, 11, 12))
      result
    }
    test("case 3 - overlap range") {
      val result = Parser.parse("1-5, 3-7")
      assert(result == Set(1, 2, 3, 4, 5, 6, 7))
      result
    }
    test("case 4 - overlap range") {
      val result = Parser.parse("1-5, 3-7, 6-10")
      assert(result == Set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10))
      result
    }
    test("case 5 - overlap range and single number") {
      val result = Parser.parse("1-5, 3-7, 6-10, 8-12, 14")
      assert(result == Set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14))
      result
    }
  }
}