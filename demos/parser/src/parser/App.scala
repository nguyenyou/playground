package demos.parser

import org.scalajs.dom
import com.raquo.laminar.api.L.*

case class App() {
  val inputVar = Var("")
  val inputSignal = inputVar.signal.distinct
  val isValidSignal = inputSignal.map(Parser.isValidFormat)
  val parsedSignal: Signal[Either[String, Set[Int]]] = inputSignal.map(Parser.parse)
  val validParsedSignal: Signal[Option[Set[Int]]] = parsedSignal.map {
    case Right(result) => Some(result)
    case Left(_) => None
  }

  def apply() = {
    div(
      cls("space-y-1"),
      div(
        cls("flex gap-2 items-center"),
        input(
          cls := "input",
          tpe := "text",
          placeholder := "Ex. 1, 2-4",
          value <-- inputSignal,
          onInput.mapToValue --> inputVar
        )
      ),
      div(
        cls("flex gap-2 items-center"),
        span("Validation: "),
        span(
          cls("hidden") <-- inputSignal.map(_.isEmpty),
          cls <-- isValidSignal.map(if (_) "text-green-500" else "text-red-500"),
          text <-- parsedSignal.map {
            case Right(_) => "✓ Valid"
            case Left(error) => s"✗ $error"
          }
        )
      ),
      div(
        cls("flex gap-2 items-center"),
        span("Parsed result: "),
        span(
          text <-- parsedSignal.map {
            case Right(result) => result.toString()
            case Left(_) => ""
          }
        )
      ),
      div(
        cls("flex gap-2 items-center"),
        cls("hidden") <-- parsedSignal.map(_.isLeft),
        span("Sorted page indexes: "),
        span(
          text <-- parsedSignal.map {
            case Right(result) => result.toSeq.sorted.mkString(", ")
            case Left(_) => ""
          }
        )
      )
    )
  }
}
