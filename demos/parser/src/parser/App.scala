package demos.parser

import org.scalajs.dom
import com.raquo.laminar.api.L.*

case class App() {
  val inputVar = Var("")
  val inputSignal = inputVar.signal.distinct
  val isValidSignal = inputSignal.map(Parser.validateFormat)

  def apply() = {
    div(
      cls("space-y-2"),
      div(
        cls("flex gap-2 items-center"),
        input(
          cls := "input",
          tpe := "text",
          placeholder := "Ex. 1, 2-4",
          value <-- inputSignal,
          onInput.mapToValue --> inputVar
        ),
        button(
          "Parse",
          cls := "btn btn-primary",
          onClick(_.sample(inputSignal)) --> Observer[String] { str =>
            println(str)
            val isValid = Parser.parse(str)
            println(isValid)
          }
        )
      ),
      div(
        cls("flex gap-2 items-center"),
        span("Validation: "),
        span(
          cls <-- isValidSignal.map { isValid =>
            if (isValid) "text-green-500" else "text-red-500"
          },
          text <-- isValidSignal.map(if (_) "Valid" else "Invalid")
        )
      )
    )
  }
}
