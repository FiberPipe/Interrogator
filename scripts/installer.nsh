; scripts/installer.nsh

!macro customHeader
  !system "echo Interrogator Installer"
!macroend

!macro customInit
  ; Проверка запущенного приложения
  !include "FileFunc.nsh"
  !insertmacro GetParameters
  !insertmacro GetOptions
  
  ; Закрытие запущенных экземпляров
  ${If} ${FileExists} "$INSTDIR\${PRODUCT_FILENAME}.exe"
    nsExec::ExecToStack 'taskkill /F /IM ${PRODUCT_FILENAME}.exe'
  ${EndIf}
!macroend

!macro customInstall
  ; Создание дополнительных ярлыков
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_FILENAME}.exe" "" "$INSTDIR\${PRODUCT_FILENAME}.exe" 0
  
  ; Регистрация в Windows
  WriteRegStr HKCU "Software\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\${PRODUCT_NAME}" "Version" "${VERSION}"
  
  ; Добавление в автозапуск (опционально, закомментировано)
  ; WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}" "$INSTDIR\${PRODUCT_FILENAME}.exe"
!macroend

!macro customUnInstall
  ; Удаление из автозапуска
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}"
  
  ; Очистка реестра
  DeleteRegKey HKCU "Software\${PRODUCT_NAME}"
  
  ; Удаление ярлыков
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
!macroend

!macro customInstallMode
  ; Режим установки - только для текущего пользователя
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro customWelcomePage
  ; Кастомная страница приветствия (опционально)
!macroend

; Прогресс установки
!macro customInstallerSectionStart
  DetailPrint "Установка ${PRODUCT_NAME}..."
!macroend

!macro customInstallerSectionEnd
  DetailPrint "Установка завершена успешно!"
!macroend
