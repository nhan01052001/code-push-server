import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as childProcess from "child_process";
import { promisify } from "util";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { getDeploymentHistory } from "../../util/api";
import { decryptData } from "../../util/crypto-utils";
import { Configuration } from "../../entity/configuration.entity";
import { Repository } from "typeorm";

@Injectable()
export class CmdService {
  private readonly isWindows: boolean;
  private readonly isMacOS: boolean;

  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>
  ) {
    const platform = os.platform();
    this.isWindows = platform === "win32";
    this.isMacOS = platform === "darwin";
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * Chạy một lệnh trong CMD và đóng khi hoàn thành
   * @param command Lệnh cần chạy trong CMD
   * @returns Promise với kết quả hoặc lỗi
   */
  async runCommand(
    command: string
  ): Promise<{ success: boolean; result: string }> {
    try {
      // Tạo lệnh để mở CMD, chạy lệnh và tự đóng (sử dụng /C)
      const cmdCommand = `cmd.exe /C ${command}`;

      // Sử dụng promisify để biến child_process.exec thành một promise
      const exec = promisify(childProcess.exec);

      // Chạy lệnh và đợi kết quả
      const { stdout, stderr } = await exec(cmdCommand);

      if (stderr && stderr.trim() !== "") {
        return {
          success: false,
          result: stderr,
        };
      }

      return {
        success: true,
        result: stdout,
      };
    } catch (error) {
      return {
        success: false,
        result: error.message,
      };
    }
  }

  /**
   * Chạy lệnh trong cửa sổ CMD hiển thị cho người dùng
   * @returns Promise với kết quả hoặc lỗi
   */
  async runCommandWithVisibleWindow(body: {
    iosApp?: string;
    iosDeployment?: string;
    iosDescription?: string;
    androidApp?: string;
    androidDeployment?: string;
    androidDescription?: string;
    branch: string;
    accessKey: string;
  }): Promise<{ success: boolean; result: string }> {
    return new Promise(async (resolve) => {
      try {
        if (!body.iosApp && !body.androidApp) {
          resolve({
            success: false,
            result: "Vui lòng nhập tên app Android hoặc IOS!",
          });
        }
        const source: Configuration[] =
          await this.configurationRepository.query(
            `SELECT * FROM Sys_Configuration 
            WHERE NameAppAndroid='${body.androidApp}' 
            OR NameAppIOS='${body.iosApp}'
            AND IsDelete IS NOT NULL`
          );

        if (!source || source.length < 1 || !source?.[0]?.Source) {
          resolve({
            success: false,
            result: "Không tìm thấy source!",
          });
        } else if (!source?.[0]?.VersionAndroid && !source?.[0]?.VersionIOS) {
          resolve({
            success: false,
            result: `Không tìm thấy version ${!source?.[0]?.VersionAndroid && !source?.[0]?.VersionIOS ? "Android và IOS" : !source?.[0]?.VersionIOS ? "IOS" : "Android"}`,
          });
        }

        // Xây dựng lệnh cho Android và iOS riêng biệt để chạy độc lập
        let androidCommand = "";
        let iosCommand = "";
        let versionAndroid_Old = null,
          versionIOS_Old = null;
        let string_token = body.accessKey;

        if (!string_token) {
          resolve({
            success: false,
            result: "Access key không hợp lệ!",
          });
        }

        string_token = decryptData(string_token);

        if (
          body.androidApp &&
          body.androidDeployment &&
          body.androidDescription &&
          source?.[0]?.VersionAndroid
        ) {
          androidCommand = `cd ${source[0].Source} && git checkout ${body.branch} && git pull && code-push-standalone release-react ${body.androidApp} android -d ${body.androidDeployment} --description "${body.androidDescription}" -m -t ${source?.[0]?.VersionAndroid}`;
          const respone = await getDeploymentHistory(
            body.androidApp,
            body.androidDeployment,
            string_token
          );
          if (Array.isArray(respone?.history)) {
            if (respone?.history.length === 0) {
              versionAndroid_Old = "v0";
            } else {
              versionAndroid_Old =
                respone?.history[respone?.history.length - 1]?.label;
            }
          }
        }

        if (
          body.iosApp &&
          body.iosDeployment &&
          body.iosDescription &&
          source?.[0]?.VersionIOS
        ) {
          if (androidCommand.length === 0)
            iosCommand = `cd ${source[0].Source} && git checkout ${body.branch} && git pull && code-push-standalone release-react ${body.iosApp} ios -d ${body.iosDeployment} --description "${body.iosDescription}" -m -t ${source?.[0]?.VersionIOS}`;
          else
            iosCommand = `code-push-standalone release-react ${body.iosApp} ios -d ${body.iosDeployment} --description "${body.iosDescription}" -m -t ${source?.[0]?.VersionIOS}`;

          const respone = await getDeploymentHistory(
            body.iosApp,
            body.iosDeployment,
            string_token
          );
          if (Array.isArray(respone?.history)) {
            if (respone?.history.length === 0) {
              versionIOS_Old = "v0";
            } else {
              versionIOS_Old =
                respone?.history[respone?.history.length - 1]?.label;
            }
          }
        }

        const id = uuidv4();
        const projectDir = path.resolve(__dirname, "../../.."); // hoặc chỉnh lại tùy theo vị trí file
        const tempDir = path.join(
          projectDir,
          "scripts",
          "temp",
          `upload-cmd-${id}`
        );
        fs.mkdirSync(tempDir, { recursive: true });

        const flagPath = path.join(tempDir, "done-flag.txt");
        const errorPath = path.join(tempDir, "error.txt");
        const scriptPath = path.join(
          tempDir,
          this.isWindows ? "script.bat" : "script.sh"
        );
        // Đường dẫn tới file VBScript cho việc gửi phím Enter
        const vbsScriptPath = path.join(tempDir, "send-enter.vbs");

        const nodeBinPath =
          "/Users/nguyenthanhnhan/.nvm/versions/node/16.16.0/bin"; // chỉnh path nếu cần

        let scriptContent = "";

        fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

        // Tạo VBScript để gửi phím Enter
        if (this.isWindows) {
          const vbsContent = `
Set WshShell = WScript.CreateObject("WScript.Shell")
WshShell.SendKeys "{ENTER}"
          `.trim();
          fs.writeFileSync(vbsScriptPath, vbsContent);
        }

        const { exec, spawn } = childProcess;

        const runScript = () => {
          if (this.isWindows) {
            // Tạo một tên duy nhất cho cửa sổ CMD để dễ nhận diện
            const uniqueWindowTitle = `Deploy_Script_${id.substring(0, 8)}`;
            const androidFlagPath = path.join(tempDir, "android-done-flag.txt");
            const iosFlagPath = path.join(tempDir, "ios-done-flag.txt");
            const androidErrorPath = path.join(tempDir, "android-error.txt");
            const iosErrorPath = path.join(tempDir, "ios-error.txt");

            // Tạo batch script cho Android
            let androidScriptPath = "";
            if (androidCommand) {
              androidScriptPath = path.join(tempDir, "android_script.bat");
              const androidScriptContent = `
@echo off
echo Executing Android deployment...
echo.

(
  ${androidCommand}
  echo.
  echo ==================================
  echo Android command executed successfully!
  echo ==================================
  echo done > "${androidFlagPath}"
) || (
  echo.
  echo ==================================
  echo Error occurred during Android execution!
  echo ==================================
  echo Lỗi khi chạy lệnh Android > "${androidErrorPath}"
)
`.trim();
              fs.writeFileSync(androidScriptPath, androidScriptContent);
            }

            // Tạo batch script cho iOS
            let iosScriptPath = "";
            if (iosCommand) {
              iosScriptPath = path.join(tempDir, "ios_script.bat");
              const iosScriptContent = `
@echo off
echo Executing iOS deployment...
echo.

(
  ${iosCommand}
  echo.
  echo ==================================
  echo iOS command executed successfully!
  echo ==================================
  echo done > "${iosFlagPath}"
) || (
  echo.
  echo ==================================
  echo Error occurred during iOS execution!
  echo ==================================
  echo Lỗi khi chạy lệnh iOS > "${iosErrorPath}"
)
`.trim();
              fs.writeFileSync(iosScriptPath, iosScriptContent);
            }

            // Tạo batch script chính để thực thi cả Android và iOS độc lập
            const mainScriptPath = path.join(tempDir, "main_script.bat");
            const mainScriptContent = `
@echo off
title ${uniqueWindowTitle}
echo Starting deployment process...
echo.

${androidCommand ? `call "${androidScriptPath}"` : ''}
${androidCommand && iosCommand ? 'echo.\necho ===== Android Completed - Starting iOS =====\necho.\n' : ''}
${iosCommand ? `call "${iosScriptPath}"` : ''}

echo.
echo ==================================
echo All commands executed!
echo ==================================
echo done > "${flagPath}"
`.trim();
            fs.writeFileSync(mainScriptPath, mainScriptContent);

            // Tạo script VBS để chờ và nhấn Enter khi có prompt hiện ra - chỉ nhắm vào cửa sổ có tiêu đề cụ thể
            const enterPressVbsPath = path.join(tempDir, "press_enter.vbs");
            const enterPressVbsContent = `
Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Thời gian bắt đầu để tính timeout
startTime = Timer()
timeoutSeconds = 300 ' 5 phút timeout
finished = False

Do While Not finished And (Timer() - startTime) < timeoutSeconds
  ' Cố gắng tìm cửa sổ Command Prompt với tiêu đề cụ thể
  If objShell.AppActivate("${uniqueWindowTitle}") Then
    WScript.Sleep 1000
    ' Kiểm tra file flag hoàn thành
    If fso.FileExists("${flagPath.replace(/\\/g, "\\\\")}") Then
      finished = True
    End If
    ' Gửi phím Enter để xác nhận tất cả các prompt
    objShell.SendKeys "{ENTER}"
    WScript.Sleep 2000
  Else
    WScript.Sleep 500
    ' Kiểm tra xem process đã kết thúc chưa
    If fso.FileExists("${flagPath.replace(/\\/g, "\\\\")}") Then
      finished = True
    End If
  End If
Loop

' Tự động kết thúc script VBS này và dọn dẹp
On Error Resume Next
Set taskKill = objShell.Exec("taskkill /f /im cscript.exe /fi ""PID ne " & CreateObject("WScript.Shell").Exec("tasklist /v /fo csv /nh /fi ""imagename eq cscript.exe""").StdOut.ReadAll())
`.trim();

            fs.writeFileSync(enterPressVbsPath, enterPressVbsContent);

            // Tạo một batch script để khởi chạy và quản lý VBScript
            const vbsLauncherPath = path.join(tempDir, "vbs_launcher.bat");
            const vbsLauncherContent = `
@echo off
start /min cscript //nologo "${enterPressVbsPath}"
exit
`.trim();
            fs.writeFileSync(vbsLauncherPath, vbsLauncherContent);

            // Chạy script VBS launcher trong nền (ẩn hoàn toàn)
            exec(`"${vbsLauncherPath}" > nul 2>&1`);

            // Chạy script chính với CMD hiện ra
            exec(`start cmd /c "${mainScriptPath}"`);

          } else if (this.isMacOS) {
            // Cho macOS, tạo script wrapper để đóng terminal sạch hơn
            const wrapperScriptPath = path.join(tempDir, "wrapper.sh");
            const wrapperContent = `#!/bin/bash
  # Terminal wrapper script
  bash "${scriptPath}"
  EXIT_CODE=$?
  
  # Đóng terminal window một cách sạch sẽ
  osascript -e 'tell application "Terminal" to close (windows whose name contains "'$(basename "${scriptPath}")'")' 2>/dev/null || true
  
  exit $EXIT_CODE`;

            fs.writeFileSync(wrapperScriptPath, wrapperContent, {
              mode: 0o755,
            });

            exec(
              `osascript -e 'tell app "Terminal" to do script "bash \\"${wrapperScriptPath}\\""'`,
              (error, stdout, stderr) => {
                if (error) {
                  // Fallback cho iTerm với approach tương tự
                  const iTerrmWrapperContent = `#!/bin/bash
  bash "${scriptPath}"
  EXIT_CODE=$?
  
  # Đóng iTerm tab
  osascript -e 'tell application "iTerm" to close current window' 2>/dev/null || true
  
  exit $EXIT_CODE`;

                  const iTermWrapperPath = path.join(
                    tempDir,
                    "iterm_wrapper.sh"
                  );
                  fs.writeFileSync(iTermWrapperPath, iTerrmWrapperContent, {
                    mode: 0o755,
                  });

                  exec(
                    `osascript -e 'tell application "iTerm" to create window with default profile command "bash \\"${iTermWrapperPath}\\""'`
                  );
                }
              }
            );
          } else {
            // Linux: thêm --wait để đóng terminal sau khi script hoàn thành
            exec(`gnome-terminal --wait -- bash -c "${scriptPath}"`);
          }
        };

        runScript();

        const timeoutMs = 1000 * 60 * 5; // 5 phút
        const startTime = Date.now();

        const interval = setInterval(async () => {
          try {
            // Kiểm tra hoàn thành tổng quát
            if (fs.existsSync(flagPath)) {
              clearInterval(interval);
              let resultUpdate = [false, false];

              // Kiểm tra android
              if (body.androidApp && body.androidDeployment && body.androidDescription) {
                // Kiểm tra theo file flag riêng của Android
                const androidCompleted = fs.existsSync(path.join(tempDir, "android-done-flag.txt"));
                const androidError = fs.existsSync(path.join(tempDir, "android-error.txt"));

                if (androidCompleted && typeof versionAndroid_Old === "string") {
                  const responseAndroid = await getDeploymentHistory(
                    body.androidApp,
                    body.androidDeployment,
                    string_token
                  );
                  let versionAndroid_New = null;
                  if (Array.isArray(responseAndroid?.history)) {
                    if (responseAndroid?.history.length > 0) {
                      versionAndroid_New =
                        responseAndroid?.history[
                          responseAndroid?.history.length - 1
                        ]?.label;

                      if (typeof versionAndroid_New === "string") {
                        let numberVersion_Old = Number(
                          versionAndroid_Old.replace("v", "")
                        );
                        let numberVersion_New = Number(
                          versionAndroid_New.replace("v", "")
                        );
                        if (
                          !isNaN(numberVersion_Old) &&
                          !isNaN(numberVersion_New) &&
                          numberVersion_New > numberVersion_Old
                        ) {
                          resultUpdate[0] = true;
                        }
                      }
                    }
                  }
                }
              } else {
                resultUpdate[0] = null;
              }

              // Kiểm tra iOS
              if (body.iosApp && body.iosDeployment && body.iosDescription) {
                // Kiểm tra theo file flag riêng của iOS
                const iosCompleted = fs.existsSync(path.join(tempDir, "ios-done-flag.txt"));
                const iosError = fs.existsSync(path.join(tempDir, "ios-error.txt"));

                if (iosCompleted && typeof versionIOS_Old === "string") {
                  const responseIOS = await getDeploymentHistory(
                    body.iosApp,
                    body.iosDeployment,
                    string_token
                  );
                  let versionIOS_New = null;
                  if (Array.isArray(responseIOS?.history)) {
                    if (responseIOS?.history.length > 0) {
                      versionIOS_New =
                        responseIOS?.history[responseIOS?.history.length - 1]
                          ?.label;

                      if (typeof versionIOS_New === "string") {
                        let numberVersion_Old = Number(
                          versionIOS_Old.replace("v", "")
                        );
                        let numberVersion_New = Number(
                          versionIOS_New.replace("v", "")
                        );
                        if (
                          !isNaN(numberVersion_Old) &&
                          !isNaN(numberVersion_New) &&
                          numberVersion_New > numberVersion_Old
                        ) {
                          resultUpdate[1] = true;
                        }
                      }
                    }
                  }
                }
              } else {
                resultUpdate[1] = null;
              }

              // Tắt tất cả các process cscript.exe trước khi dọn dẹp
              if (this.isWindows) {
                try {
                  exec('taskkill /f /im cscript.exe', { timeout: 3000 });
                } catch (err) {
                  // Bỏ qua lỗi nếu không tắt được cscript.exe
                }
              }

              // Dọn dẹp các tệp tạm sau khi xử lý xong
              try {
                fs.rmSync(tempDir, { recursive: true, force: true });
              } catch (err) {
                // Bỏ qua lỗi nếu không xóa được thư mục
              }

              // Trả về kết quả dựa trên việc cập nhật
              if (resultUpdate[0] === true && resultUpdate[1] === true) {
                resolve({ success: true, result: "Update Android và iOS thành công!" });
              } else if (
                resultUpdate[0] === true &&
                resultUpdate[1] === false
              ) {
                resolve({
                  success: true,
                  result:
                    "Update Android thành công, update iOS thất bại. Vui lòng kiểm tra lại!",
                });
              } else if (resultUpdate[0] === true && resultUpdate[1] === null) {
                resolve({ success: true, result: "Update Android thành công" });
              } else if (
                resultUpdate[0] === false &&
                resultUpdate[1] === true
              ) {
                resolve({
                  success: true,
                  result:
                    "Update iOS thành công, update Android thất bại. Vui lòng kiểm tra lại!",
                });
              } else if (resultUpdate[0] === null && resultUpdate[1] === true) {
                resolve({ success: true, result: "Update iOS thành công" });
              } else if (resultUpdate[0] === false && resultUpdate[1] === false) {
                resolve({ success: false, result: "Update Android và iOS không thành công!" });
              } else {
                resolve({ success: false, result: "Update không thành công!" });
              }
            } else if (Date.now() - startTime > timeoutMs) {
              clearInterval(interval);

              // Tắt tất cả các process cscript.exe trước khi dọn dẹp
              if (this.isWindows) {
                try {
                  exec('taskkill /f /im cscript.exe', { timeout: 3000 });
                } catch (err) {
                  // Bỏ qua lỗi nếu không tắt được cscript.exe
                }
              }

              // Dọn dẹp các tệp tạm
              try {
                fs.rmSync(tempDir, { recursive: true, force: true });
              } catch (err) {
                // Bỏ qua lỗi nếu không xóa được thư mục
              }

              resolve({
                success: false,
                result: "Hết thời gian chờ thực thi lệnh.",
              });
            }
          } catch (err) {
            // Tắt tất cả các process cscript.exe trước khi dọn dẹp
            if (this.isWindows) {
              try {
                exec('taskkill /f /im cscript.exe', { timeout: 3000 });
              } catch (killErr) {
                // Bỏ qua lỗi nếu không tắt được cscript.exe
              }
            }

            resolve({
              success: false,
              result: err.message,
            });
          }
        }, 1000);
      } catch (err: any) {
        resolve({ success: false, result: err.message });
      }
    });
  }
}
