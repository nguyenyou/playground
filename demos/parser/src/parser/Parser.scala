package demos.parser

import scala.util.{Try, Success, Failure}

case class Parser(maxNumber: Int) {
  
  private val NumberPattern = "\\d+".r
  private val RangePattern = "(\\d+)\\s*-\\s*(\\d+)".r
  
  private sealed trait ParseResult
  private case class ValidNumber(value: Int) extends ParseResult
  private case class ValidRange(start: Int, end: Int) extends ParseResult
  private case class InvalidPart(part: String, reason: String) extends ParseResult
  
  def validateFormat(input: String): Either[String, Unit] = {
    parseInternal(input).map(_ => ())
  }
  
  def parse(input: String): Either[String, Set[Int]] = {
    parseInternal(input)
  }
  
  // Convenience methods for those who want boolean/exception behavior
  def isValidFormat(input: String): Boolean = {
    validateFormat(input).isRight
  }
  
  private def parseInternal(input: String): Either[String, Set[Int]] = {
    if (input.trim.isEmpty) {
      return Left("Input cannot be empty")
    }
    
    // Check for invalid leading/trailing commas first
    val trimmed = input.trim
    if (trimmed.startsWith(",") || trimmed.endsWith(",")) {
      return Left("Input cannot start or end with comma")
    }
    
    // Check for consecutive commas
    if (input.contains(",,")) {
      return Left("Input cannot contain consecutive commas")
    }
    
    // Split and process each part - don't filter empty parts, detect them as invalid
    val parts = input.split(",").map(_.trim)
    
    if (parts.isEmpty) {
      return Left("No valid parts found after splitting")
    }
    
    val results = parts.map(parsePart)
    
    // Check for any invalid parts
    results.collectFirst { case InvalidPart(part, reason) => 
      Left(s"Invalid part '$part': $reason")
    }.getOrElse {
      // All parts are valid, extract the numbers
      val numbers = results.flatMap {
        case ValidNumber(n) => Set(n)
        case ValidRange(start, end) => (start to end).toSet
        case InvalidPart(_, _) => Set.empty[Int] // Should never happen due to above check
      }.toSet
      
      Right(numbers)
    }
  }
  
  private def parsePart(part: String): ParseResult = {
    if (part.isEmpty) {
      return InvalidPart(part, "empty part")
    }
    
    part match {
      case NumberPattern() =>
        Try(part.toInt) match {
          case Success(n) => 
            if (n == 0) {
              InvalidPart(part, "zero is not allowed (numbers must start from 1)")
            } else if (n > maxNumber) {
              InvalidPart(part, s"number cannot exceed ${maxNumber}")
            } else {
              ValidNumber(n)
            }
          case Failure(_) => InvalidPart(part, s"number cannot exceed ${maxNumber}")
        }
        
      case RangePattern(startStr, endStr) =>
        (Try(startStr.toInt), Try(endStr.toInt)) match {
          case (Success(start), Success(end)) =>
            if (start == 0 || end == 0) {
              InvalidPart(part, "zero is not allowed in ranges (numbers must start from 1)")
            } else if (start > maxNumber || end > maxNumber) {
              InvalidPart(part, s"number cannot exceed ${maxNumber}")
            } else if (start == end) {
              InvalidPart(part, "range cannot have the same start and end number (use single number instead)")
            } else if (start < end) {
              ValidRange(start, end)
            } else {
              InvalidPart(part, s"invalid range order: start ($start) must be < end ($end)")
            }
          case _ => InvalidPart(part, s"number cannot exceed ${maxNumber}")
        }
        
      case _ =>
        // Check for common error patterns to provide better error messages
        if (part.contains("-")) {
          if (part.startsWith("-")) {
            InvalidPart(part, "range cannot start with hyphen (negative numbers not supported)")
          } else if (part.endsWith("-")) {
            InvalidPart(part, "range cannot end with hyphen")
          } else if (part.count(_ == '-') > 1) {
            InvalidPart(part, "range can only contain one hyphen")
          } else {
            InvalidPart(part, "invalid range format (expected: number-number)")
          }
        } else if (part.matches(".*[^0-9\\s-].*")) {
          InvalidPart(part, "contains invalid characters (only digits, spaces, commas, and hyphens allowed)")
        } else {
          InvalidPart(part, "invalid format")
        }
    }
  }
}

object Parser {
  // Default instance with maxNumber = 1000
  private val defaultInstance = Parser(maxNumber = 1000)
  
  // Delegate methods to the default instance for convenience
  def parse(input: String): Either[String, Set[Int]] = defaultInstance.parse(input)
  
  def validateFormat(input: String): Either[String, Unit] = defaultInstance.validateFormat(input)
  
  def isValidFormat(input: String): Boolean = defaultInstance.isValidFormat(input)
}