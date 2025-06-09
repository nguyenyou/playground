package demos.parser

object Parser {
  def validateFormat(input: String): Boolean = {
    if (input.isEmpty) return false
    
    // Check for valid characters only (digits, comma, space, hyphen)
    if (!input.matches("[0-9, -]+")) return false
    
    // Check for consecutive commas
    if (input.contains(",,")) return false
    
    // Check for leading or trailing commas
    if (input.trim.startsWith(",") || input.trim.endsWith(",")) return false
    
    // Split by comma and validate each part
    val parts = input.split(",").map(_.trim)
    
    parts.forall { part =>
      if (part.isEmpty) false
      else if (part.contains("-")) {
        // Validate range format: number-number
        val rangeParts = part.split("-")
        // Must have exactly 2 parts, both non-empty and numeric
        // Also check that there are no trailing hyphens by ensuring no more than one hyphen between numbers
        // And check that start <= end for valid range
        rangeParts.length == 2 && 
        rangeParts(0).trim.nonEmpty && 
        rangeParts(1).trim.nonEmpty &&
        rangeParts(0).trim.matches("\\d+") && 
        rangeParts(1).trim.matches("\\d+") &&
        !part.endsWith("-") && // Reject trailing hyphens
        rangeParts(0).trim.toInt <= rangeParts(1).trim.toInt // Validate range order
      } else {
        // Validate single number
        part.matches("\\d+")
      }
    }
  }
  
  def parse(input: String): Set[Int] = {
    if (!validateFormat(input)) {
      throw new IllegalArgumentException(s"Invalid input format: $input")
    }
    
    input.split(",")
      .map(_.trim)
      .flatMap { part =>
        if (part.contains("-")) {
          // Handle range like "5-7"
          val Array(start, end) = part.split("-").map(_.trim.toInt)
          start to end
        } else {
          // Handle single number
          Seq(part.toInt)
        }
      }
      .toSet
  }
}