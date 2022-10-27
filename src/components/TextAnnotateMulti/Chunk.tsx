import React from "react";
import LabeledChunk from "./LabeledChunk";

type ChunkProps = {
  text: string;
  start: number;
  end: number;
  mark: boolean;
  labelNames: Set<string>;

  getBackgroungColor: (labelNames: Set<string>) => string;
  textElementGenerator?: (text: string) => string | JSX.Element | JSX.Element[];

  onClick: (start: number, end: number) => void;
};

const Chunk = (props: ChunkProps) => {
  if (props.mark) return <LabeledChunk {...props} />;
  return (
    <span
      data-start={props.start}
      data-end={props.end}
      onClick={() => props.onClick(props.start, props.end)}
    >
      {props.textElementGenerator !== undefined &&
        props.textElementGenerator(props.text)}
      {props.textElementGenerator === undefined && props.text}
    </span>
  );
};

export default Chunk;
