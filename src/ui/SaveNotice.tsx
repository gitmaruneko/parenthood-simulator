import { useEffect, useRef } from "react";

export function SaveNotice({
  message,
  busy,
  canRetry,
  onRetry,
  onHome,
}: {
  message: string;
  busy: boolean;
  canRetry: boolean;
  onRetry: () => void;
  onHome: () => void;
}) {
  const notice = useRef<HTMLDivElement>(null);
  useEffect(() => {
    notice.current?.focus();
  }, [message]);
  return (
    <div className="error-banner" role="alert" ref={notice} tabIndex={-1}>
      <p>{message}</p>
      {canRetry && (
        <button disabled={busy} onClick={onRetry}>
          重試儲存
        </button>
      )}
      <button disabled={busy} onClick={onHome}>
        返回首頁並重新讀取
      </button>
    </div>
  );
}
