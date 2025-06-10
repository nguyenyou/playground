package demos.parser

import demos.parser.Parser

import utest.*

object ParserTests extends TestSuite {
  def tests = Tests {
    test("parse") {
      test("single number") {
        val result = Parser.parse("5")
        assert(result == Right(Set(5)))
      }
      
      test("simple range") {
        val result = Parser.parse("5-7")
        assert(result == Right(Set(5, 6, 7)))
      }
      
      test("single range with same start and end") {
        val result = Parser.parse("5-5")
        assert(result == Right(Set(5)))
      }
      
      test("comma separated numbers") {
        val result = Parser.parse("9, 10, 12")
        assert(result == Right(Set(9, 10, 12)))
      }
      
      test("mixed ranges and singles") {
        val result = Parser.parse("9, 10-12")
        assert(result == Right(Set(9, 10, 11, 12)))
      }
      
      test("overlapping ranges") {
        val result = Parser.parse("1-5, 3-7")
        assert(result == Right(Set(1, 2, 3, 4, 5, 6, 7)))
      }
      
      test("complex overlapping with singles") {
        val result = Parser.parse("1-3, 5, 2-6, 8")
        assert(result == Right(Set(1, 2, 3, 4, 5, 6, 8)))
      }
      
      test("whitespace handling") {
        val result = Parser.parse("  1-3  ,   5   , 7-9  ")
        assert(result == Right(Set(1, 2, 3, 5, 7, 8, 9)))
      }
      
      test("large numbers") {
        val result = Parser.parse("100-102, 200")
        assert(result == Right(Set(100, 101, 102, 200)))
      }
      
      test("invalid input returns Left") {
        val result = Parser.parse("invalid")
        assert(result.isLeft)
        assert(result.left.get.contains("contains invalid characters"))
      }
    }
    
    test("validateFormat") {
      test("valid inputs") {
        // Basic valid cases
        assert(Parser.validateFormat("5").isRight)
        assert(Parser.validateFormat("5-7").isRight)
        assert(Parser.validateFormat("1, 2, 3").isRight)
        assert(Parser.validateFormat("1-5, 7, 9-12").isRight)
        
        // Whitespace variations
        assert(Parser.validateFormat("1  ,   2   ,  3-5").isRight)
        assert(Parser.validateFormat("1,2,3-5").isRight)
        assert(Parser.validateFormat("  1-3  ").isRight)
        
        // Edge cases
        assert(Parser.validateFormat("5-5").isRight)  // Same start and end
        assert(Parser.validateFormat("100-200").isRight)  // Large numbers
      }
      
      test("invalid inputs") {
        // Empty and whitespace only
        assert(Parser.validateFormat("").isLeft)
        assert(Parser.validateFormat("   ").isLeft)
        
        // Invalid punctuation usage
        assert(Parser.validateFormat(",").isLeft)
        assert(Parser.validateFormat("-").isLeft)
        assert(Parser.validateFormat("1,,2").isLeft)
        assert(Parser.validateFormat(",1,2").isLeft)
        assert(Parser.validateFormat("1,2,").isLeft)
        
        // Invalid range formats  
        assert(Parser.validateFormat("-7").isLeft)      // Missing start
        assert(Parser.validateFormat("5-").isLeft)      // Missing end
        assert(Parser.validateFormat("1-2-3").isLeft)   // Multiple hyphens
        assert(Parser.validateFormat("1-2-").isLeft)    // Trailing hyphen after range
        assert(Parser.validateFormat("10-5").isLeft)    // Invalid range order
        
        // Invalid characters
        assert(Parser.validateFormat("1,a,3").isLeft)   // Letters
        assert(Parser.validateFormat("1,2@3").isLeft)   // Special characters
        assert(Parser.validateFormat("-1-2").isLeft)    // Negative numbers
        
        // Empty parts
        assert(Parser.validateFormat("1, ,3").isLeft)   // Empty middle part
      }
    }
    
    test("detailed error messages") {
      test("specific error for negative numbers") {
        val result = Parser.parse("-5-10")
        assert(result.isLeft)
        assert(result.left.get.contains("range cannot start with hyphen"))
      }
      
      test("specific error for trailing hyphen") {
        val result = Parser.parse("5-")
        assert(result.isLeft)
        assert(result.left.get.contains("range cannot end with hyphen"))
      }
      
      test("specific error for invalid range order") {
        val result = Parser.parse("10-5")
        assert(result.isLeft)
        assert(result.left.get.contains("invalid range order"))
      }
      
      test("specific error for multiple hyphens") {
        val result = Parser.parse("1-2-3")
        assert(result.isLeft)
        assert(result.left.get.contains("range can only contain one hyphen"))
      }
      
      test("specific error for invalid characters") {
        val result = Parser.parse("1,a,3")
        assert(result.isLeft)
        assert(result.left.get.contains("contains invalid characters"))
      }
      
      test("specific error for empty input") {
        val result = Parser.parse("")
        assert(result.isLeft)
        assert(result.left.get.contains("Input cannot be empty"))
      }
      
      test("specific error for consecutive commas") {
        val result = Parser.parse("1,,3")
        assert(result.isLeft)
        assert(result.left.get.contains("Input cannot contain consecutive commas"))
      }
    }
    
    test("convenience methods") {
      test("isValidFormat works like old validateFormat") {
        assert(Parser.isValidFormat("5"))
        assert(Parser.isValidFormat("5-7"))
        assert(!Parser.isValidFormat("invalid"))
        assert(!Parser.isValidFormat(""))
      }
      
      test("parseUnsafe throws exceptions like old parse") {
        val result = Parser.parseUnsafe("5")
        assert(result == Set(5))
        
        intercept[IllegalArgumentException] {
          Parser.parseUnsafe("invalid")
        }
      }
    }
  }
}
