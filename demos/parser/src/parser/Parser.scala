package demos.parser

object Parser {
  def parse(input: String): Set[Int] = {
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