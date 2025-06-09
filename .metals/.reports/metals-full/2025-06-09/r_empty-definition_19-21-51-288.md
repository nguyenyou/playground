error id: file://<WORKSPACE>/build.mill:`<none>`.
file://<WORKSPACE>/build.mill
empty definition using pc, found symbol in pc: `<none>`.
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 116
uri: file://<WORKSPACE>/build.mill
text:
```scala
package build
import mill._, scalalib._, scalajslib._

object demos extends ScalaModule {
  def scalaVersion = "3.7.@@1"

  object hello extends ScalaModule {
    def scalaVersion = "3.7.1"
  }

  object quickstart extends ScalaModule {
    def scalaVersion = "3.7.1"
  }
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: `<none>`.