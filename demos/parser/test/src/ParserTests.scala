package demos.parser

import demos.parser.Parser

import utest.*

object ParserTests extends TestSuite {
  def tests = Tests {
    test("parser") {
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
    test("validate format") {
      test("valid - single number") {
        val result = Parser.validateFormat("5")
        assert(result == true)
        result
      }
      test("valid - simple range") {
        val result = Parser.validateFormat("5-7")
        assert(result == true)
        result
      }
      test("valid - comma separated numbers") {
        val result = Parser.validateFormat("1, 2, 3")
        assert(result == true)
        result
      }
      test("valid - mixed ranges and singles") {
        val result = Parser.validateFormat("1-5, 7, 9-12")
        assert(result == true)
        result
      }
      test("valid - multiple spaces") {
        val result = Parser.validateFormat("1  ,   2   ,  3-5")
        assert(result == true)
        result
      }
      test("valid - no spaces") {
        val result = Parser.validateFormat("1,2,3-5")
        assert(result == true)
        result
      }
      test("invalid - empty string") {
        val result = Parser.validateFormat("")
        assert(result == false)
        result
      }
      test("invalid - consecutive commas") {
        val result = Parser.validateFormat("1,,2")
        assert(result == false)
        result
      }
      test("invalid - leading comma") {
        val result = Parser.validateFormat(",1,2")
        assert(result == false)
        result
      }
      test("invalid - trailing comma") {
        val result = Parser.validateFormat("1,2,")
        assert(result == false)
        result
      }
      test("invalid - incomplete range start") {
        val result = Parser.validateFormat("-7")
        assert(result == false)
        result
      }
      test("invalid - incomplete range end") {
        val result = Parser.validateFormat("5-")
        assert(result == false)
        result
      }
      test("invalid - invalid characters") {
        val result = Parser.validateFormat("1,a,3")
        assert(result == false)
        result
      }
      test("invalid - special characters") {
        val result = Parser.validateFormat("1,2@3")
        assert(result == false)
        result
      }
      test("invalid - multiple hyphens in range") {
        val result = Parser.validateFormat("1-2-3")
        assert(result == false)
        result
      }
      test("invalid - only comma") {
        val result = Parser.validateFormat(",")
        assert(result == false)
        result
      }
      test("invalid - only spaces") {
        val result = Parser.validateFormat("   ")
        assert(result == false)
        result
      }
      test("invalid - hyphen without numbers") {
        val result = Parser.validateFormat("-")
        assert(result == false)
        result
      }
      test("invalid - range end with hyphen") {
        val result = Parser.validateFormat("1-2-")
        assert(result == false)
        result
      }
    }

  }
}
