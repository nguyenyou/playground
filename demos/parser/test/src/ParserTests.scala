package demos.parser

import demos.parser.Parser

import utest.*

object ParserTests extends TestSuite {
  def tests = Tests {
    test("parse") {
      test("single number") {
        val result = Parser.parse("5")
        assert(result == Set(5))
      }
      
      test("simple range") {
        val result = Parser.parse("5-7")
        assert(result == Set(5, 6, 7))
      }
      
      test("single range with same start and end") {
        val result = Parser.parse("5-5")
        assert(result == Set(5))
      }
      
      test("comma separated numbers") {
        val result = Parser.parse("9, 10, 12")
        assert(result == Set(9, 10, 12))
      }
      
      test("mixed ranges and singles") {
        val result = Parser.parse("9, 10-12")
        assert(result == Set(9, 10, 11, 12))
      }
      
      test("overlapping ranges") {
        val result = Parser.parse("1-5, 3-7")
        assert(result == Set(1, 2, 3, 4, 5, 6, 7))
      }
      
      test("complex overlapping with singles") {
        val result = Parser.parse("1-3, 5, 2-6, 8")
        assert(result == Set(1, 2, 3, 4, 5, 6, 8))
      }
      
      test("whitespace handling") {
        val result = Parser.parse("  1-3  ,   5   , 7-9  ")
        assert(result == Set(1, 2, 3, 5, 7, 8, 9))
      }
      
      test("large numbers") {
        val result = Parser.parse("100-102, 200")
        assert(result == Set(100, 101, 102, 200))
      }
      
      test("invalid input throws exception") {
        intercept[IllegalArgumentException] {
          Parser.parse("invalid")
        }
      }
    }
    
    test("validateFormat") {
      test("valid inputs") {
        // Basic valid cases
        assert(Parser.validateFormat("5"))
        assert(Parser.validateFormat("5-7"))
        assert(Parser.validateFormat("1, 2, 3"))
        assert(Parser.validateFormat("1-5, 7, 9-12"))
        
        // Whitespace variations
        assert(Parser.validateFormat("1  ,   2   ,  3-5"))
        assert(Parser.validateFormat("1,2,3-5"))
        assert(Parser.validateFormat("  1-3  "))
        
        // Edge cases
        assert(Parser.validateFormat("5-5"))  // Same start and end
        assert(Parser.validateFormat("100-200"))  // Large numbers
      }
      
      test("invalid inputs") {
        // Empty and whitespace only
        assert(!Parser.validateFormat(""))
        assert(!Parser.validateFormat("   "))
        
        // Invalid punctuation usage
        assert(!Parser.validateFormat(","))
        assert(!Parser.validateFormat("-"))
        assert(!Parser.validateFormat("1,,2"))
        assert(!Parser.validateFormat(",1,2"))
        assert(!Parser.validateFormat("1,2,"))
        
        // Invalid range formats  
        assert(!Parser.validateFormat("-7"))      // Missing start
        assert(!Parser.validateFormat("5-"))      // Missing end
        assert(!Parser.validateFormat("1-2-3"))   // Multiple hyphens
        assert(!Parser.validateFormat("1-2-"))    // Trailing hyphen after range
        assert(!Parser.validateFormat("10-5"))    // Invalid range order
        
        // Invalid characters
        assert(!Parser.validateFormat("1,a,3"))   // Letters
        assert(!Parser.validateFormat("1,2@3"))   // Special characters
        assert(!Parser.validateFormat("-1-2"))    // Negative numbers
        
        // Empty parts
        assert(!Parser.validateFormat("1, ,3"))   // Empty middle part
      }
    }
  }
}
