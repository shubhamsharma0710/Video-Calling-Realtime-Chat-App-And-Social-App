import React from "react";

const CustomMessage = (props) => {
  const message =
    props.message ||
    props.messageProps?.message ||
    props?.messageProps ||
    null;

  if (!message) return null;
  if (message.type === "system") {
    return (
      <div className="w-full text-center text-xs text-slate-400 my-3">
        {message.text}
      </div>
    );
  }
  if (message.deleted_at) {
    return (
      <div className="w-full text-center text-xs italic text-slate-500 my-3">
        This message was deleted
      </div>
    );
  }

  const isMine =
    typeof props.isMyMessage === "function"
      ? props.isMyMessage()
      : false;

  return (
    <div
      className={`w-full flex ${
        isMine ? "justify-end" : "justify-start"
      } mb-3 px-4`}
    >
      <div
        className={`max-w-[65%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow
          ${
            isMine
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-slate-800 text-slate-100 rounded-bl-sm"
          }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.text}
        </p>
        <div className="text-[10px] opacity-60 text-right mt-1">
          {message.created_at &&
            new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </div>
      </div>
    </div>
  );
};

export default CustomMessage;
