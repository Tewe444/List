!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!ifndef BUILD_UNINSTALLER
Var GamesDialog
Var GameFFA
Var GameFlight
Var GameBallman
Var GamePizza
Var GameCar
Var GameSkyDash
Var GameSnake
Var Game2048
Var GameChess
Var GameSkySwing
Var GameSkyCraft
!endif
Var KeepFFA
Var KeepFlight
Var KeepBallman
Var KeepPizza
Var KeepCar
Var KeepSkyDash
Var KeepSnake
Var Keep2048
Var KeepChess
Var KeepSkySwing
Var KeepSkyCraft

!ifndef BUILD_UNINSTALLER
Function GamesPage
  nsDialogs::Create 1018
  Pop $GamesDialog
  ${If} $GamesDialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 20u "Wähle die Spiele aus, die installiert werden sollen:"
  Pop $0

  ${NSD_CreateCheckbox} 0 24u 48% 16u "FFA Shooter"
  Pop $GameFFA
  ${NSD_SetState} $GameFFA ${BST_CHECKED}
  ${NSD_CreateCheckbox} 50% 24u 48% 16u "Flight Simulator"
  Pop $GameFlight
  ${NSD_SetState} $GameFlight ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 46u 48% 16u "Ballman"
  Pop $GameBallman
  ${NSD_SetState} $GameBallman ${BST_CHECKED}
  ${NSD_CreateCheckbox} 50% 46u 48% 16u "Pizza Simulator"
  Pop $GamePizza
  ${NSD_SetState} $GamePizza ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 68u 48% 16u "Car Horizon"
  Pop $GameCar
  ${NSD_SetState} $GameCar ${BST_CHECKED}
  ${NSD_CreateCheckbox} 50% 68u 48% 16u "Sky Dash"
  Pop $GameSkyDash
  ${NSD_SetState} $GameSkyDash ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 90u 48% 16u "Snake"
  Pop $GameSnake
  ${NSD_SetState} $GameSnake ${BST_CHECKED}
  ${NSD_CreateCheckbox} 50% 90u 48% 16u "2048"
  Pop $Game2048
  ${NSD_SetState} $Game2048 ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 112u 48% 16u "Schach"
  Pop $GameChess
  ${NSD_SetState} $GameChess ${BST_CHECKED}
  ${NSD_CreateCheckbox} 50% 112u 48% 16u "Sky Swing"
  Pop $GameSkySwing
  ${NSD_SetState} $GameSkySwing ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 134u 48% 16u "SkyCraft"
  Pop $GameSkyCraft
  ${NSD_SetState} $GameSkyCraft ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function GamesPageLeave
  ${NSD_GetState} $GameFFA $KeepFFA
  ${NSD_GetState} $GameFlight $KeepFlight
  ${NSD_GetState} $GameBallman $KeepBallman
  ${NSD_GetState} $GamePizza $KeepPizza
  ${NSD_GetState} $GameCar $KeepCar
  ${NSD_GetState} $GameSkyDash $KeepSkyDash
  ${NSD_GetState} $GameSnake $KeepSnake
  ${NSD_GetState} $Game2048 $Keep2048
  ${NSD_GetState} $GameChess $KeepChess
  ${NSD_GetState} $GameSkySwing $KeepSkySwing
  ${NSD_GetState} $GameSkyCraft $KeepSkyCraft
FunctionEnd

!macro customPageAfterChangeDir
  Page custom GamesPage GamesPageLeave
!macroend
!endif

!macro customInstall
  ${If} $KeepFFA != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\FFA"
  ${EndIf}
  ${If} $KeepFlight != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Flight-sim"
  ${EndIf}
  ${If} $KeepBallman != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\ball-man"
  ${EndIf}
  ${If} $KeepPizza != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Pizza"
  ${EndIf}
  ${If} $KeepCar != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Car-Horizon"
  ${EndIf}
  ${If} $KeepSkyDash != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Sky-Dash"
  ${EndIf}
  ${If} $KeepSnake != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Snake"
  ${EndIf}
  ${If} $Keep2048 != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\2048"
  ${EndIf}
  ${If} $KeepChess != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Schach"
  ${EndIf}
  ${If} $KeepSkySwing != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\Sky-Swing"
  ${EndIf}
  ${If} $KeepSkyCraft != ${BST_CHECKED}
    RMDir /r "$INSTDIR\resources\app\seiten\SkyCraft"
  ${EndIf}
!macroend
