package demos.parser

import org.scalajs.dom
import com.raquo.laminar.api.L.*

case class App() {
  val inputVar = Var("")
  val inputSignal = inputVar.signal.distinct
  val isValidSignal = inputSignal.map(Parser.isValidFormat)
  val parsedSignal: Signal[Option[Set[Int]]] = inputSignal.map { str =>
    Parser.parse(str) match {
      case Right(result) => Some(result)
      case Left(_) => None
    }
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
          text <-- isValidSignal.map(if (_) "Valid" else "Invalid")
        )
      ),
      div(
        cls("flex gap-2 items-center"),
        span("Parsed result: "),
        span(
          text <-- parsedSignal.map { parsed =>
            parsed.map(_.toString()).getOrElse("")
          }
        )
      ),
      div(
        cls("flex gap-2 items-center"),
        span("Sorted page indexes: "),
        span(
          text <-- parsedSignal.map { parsed =>
            parsed.map(_.toSeq.sorted.mkString(", ")).getOrElse("")
          }
        )
      )
    )
  }
}
