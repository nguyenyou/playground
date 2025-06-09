package demos.parser

import org.scalajs.dom
import com.raquo.laminar.api.L.*

@main def run = {
  val container = dom.document.querySelector("#root")
  render(container, App()())
}
