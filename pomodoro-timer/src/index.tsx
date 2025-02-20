import { Form, ActionPanel, Action, showHUD, closeMainWindow } from "@raycast/api";
import { useState } from "react";
import { exec } from "node:child_process";

export default function Command() {
  const [minutes, setMinutes] = useState<string>("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const startTimer = async () => {
    if (!minutes || isNaN(Number(minutes))) {
      await showHUD("⚠️ 有効な分数を入力してください");
      return;
    }

    const durationInSeconds = parseInt(minutes) * 60;
    setIsTimerRunning(true);
    console.log(`タイマー開始: ${minutes}分 (${durationInSeconds}秒)`);

    try {
      await closeMainWindow();
      await showHUD(`⏰ ${minutes}分のタイマーを開始しました`);

      // タイマー、通知、confettiを設定
      const command = `sleep ${durationInSeconds} && open "raycast://extensions/raycast/raycast/confetti"`;

      exec(command, (error, stdout, stderr) => {
        
        setIsTimerRunning(false);
      });

    } catch (error) {
      console.error('Error:', error);
      await showHUD("⚠️ タイマーの設定に失敗しました");
      setIsTimerRunning(false);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="タイマーを開始"
            onSubmit={() => startTimer()}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="minutes"
        title="時間（分）"
        placeholder="25"
        value={minutes}
        onChange={setMinutes}
        autoFocus
      />
    </Form>
  );
}
