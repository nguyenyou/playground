package demos.parser

import org.scalajs.dom
import com.raquo.laminar.api.L.*

case class App() {
  val inputVar = Var("")

  def apply() = {
    div(
      cls("flex gap-2 items-center"),
      input(
        cls := "input",
        tpe := "text",
        placeholder := "Ex. 1, 2-4",
        value <-- inputVar.signal.distinct,
        onChange.mapToValue --> inputVar
      ),
      button("Parse", cls := "btn btn-primary")
    )
  }
}
