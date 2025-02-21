import { Form, ActionPanel, Action, showHUD, closeMainWindow, MenuBarExtra } from "@raycast/api";
import { useState, useEffect } from "react";
import { exec, spawn } from "node:child_process";

export default function Command() {
  const [minutes, setMinutes] = useState<string>("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPid, setTimerPid] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  useEffect(() => {
    console.log("timerPid updated:", timerPid);
  }, [timerPid]);

  const resetTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setIsTimerRunning(false);
    setTimerPid(null);
    setEndTime(null);
    setMinutes("");
  };

  const startTimer = async () => {
    if (!minutes || isNaN(Number(minutes))) {
      console.log("エラー: 無効な入力値");
      await showHUD("⚠️ 有効な分数を入力してください");
      return;
    }

    const durationInSeconds = parseInt(minutes) * 60;
    setIsTimerRunning(true);
    setEndTime(new Date(Date.now() + durationInSeconds * 1000));

    try {
      const sleepProcess = spawn('sleep', [`${durationInSeconds}`]);
      console.log("新しいプロセスID:", sleepProcess.pid);
      
      if (sleepProcess.pid) {
        setTimerPid(sleepProcess.pid);
        await showHUD(`⏰ ${minutes}分のタイマーを開始しました`);
        setMinutes("");

        sleepProcess.on('exit', () => {
          exec(`osascript -e 'display notification "タイマー完了！" with title "ポモドーロタイマー"' && open "raycast://extensions/raycast/raycast/confetti"`);
          resetTimer();
        });
      }

    } catch (error) {
      console.error('Error:', error);
      await showHUD("⚠️ タイマーの設定に失敗しました");
      resetTimer();
    }
  };

  const cancelTimer = async () => {
    if (timerPid) {
      exec(`pkill -P ${timerPid}`);
      resetTimer();
      await showHUD("⏹️ タイマーを停止しました");
    } else {
      console.log(timerPid);
      await showHUD("⚠️ 実行中のタイマーはありません");
    }
  };

  if (isTimerRunning && endTime) {
    return (
      <MenuBarExtra title="⏰">
        <MenuBarExtra.Item
          title={`残り ${Math.ceil((endTime.getTime() - Date.now()) / 1000 / 60)} 分`}
        />
        <MenuBarExtra.Item
          title="タイマーを停止"
          onAction={cancelTimer}
        />
      </MenuBarExtra>
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action
              title="タイマーを開始"
              onAction={startTimer}
            />
            <Action
              title="タイマーを停止"
              onAction={cancelTimer}
              style={Action.Style.Destructive}
              shortcut={{ modifiers: ["cmd"], key: "backspace" }}
            />
          </ActionPanel.Section>
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
