import React from "react";

type LabeledChunkProps = {
  text: string;
  start: number;
  end: number;
  labelNames: Set<string>;

  getBackgroungColor: (labelNames: Set<string>) => string;
  textElementGenerator?: (text: string) => string | JSX.Element | JSX.Element[];

  onClick: (start: number, end: number) => void;
};

const LabeledChunk: React.FC<LabeledChunkProps> = (props) => {
  const textBackgroundColor = props.getBackgroungColor(props.labelNames);

  return (
    <mark
      style={{
        backgroundColor: textBackgroundColor,
        padding: "0 4px",
        borderColor: textBackgroundColor,
        borderWidth: "3px",
        borderStyle: "solid",
        cursor: "pointer",
      }}
      data-start={props.start}
      data-end={props.end}
      onMouseUp={() => props.onClick(props.start, props.end)}
    >
      {props.textElementGenerator !== undefined &&
        props.textElementGenerator(props.text)}
      {props.textElementGenerator === undefined && props.text}
      {
        <span style={{ fontSize: "0.7em", fontWeight: 500, marginLeft: 6 }}>
          {props.labelNames &&
            Array.from(props.labelNames)
              .sort()
              .map((labelName) => {
                const labelBackgroundColor = props.getBackgroungColor(
                  new Set([labelName])
                );
                console.log({ labelName, labelBackgroundColor });
                return (
                  <span
                    key={labelName}
                    className="labelName"
                    style={{
                      backgroundColor: labelBackgroundColor,
                      padding: "0 4px",
                      borderColor: "black",
                      borderRadius: "3px",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      cursor: "pointer",
                    }}
                  >
                    {labelName}
                  </span>
                );
              })}
        </span>
      }
    </mark>
  );
};

export default LabeledChunk;
