import React from "react";
import Chunk from "./Chunk";
type ChunkUnit = {
  start: number;
  end: number;
  labelNames: Set<string>;
  text: string;
  mark: boolean;
};

type LabelUnit = {
  start: number;
  end: number;
  labelName: string;
  text: string;
};

type TextAnnotateMultiProps = {
  text: string;
  labelUnits: LabelUnit[];
  labelName: string;
  updateLabelUnits: (newLabelUnits: LabelUnit[]) => void;
  getBackgroungColor: (labelNames: Set<string>) => string;
  textElementGenerator?: (text: string) => string | JSX.Element | JSX.Element[];
};

const TextAnnotateMulti = (props: TextAnnotateMultiProps) => {
  const handleMouseUp = () => {
    // add a label on selection
    const selection = window.getSelection();
    if (selection && selection.anchorNode && selection?.focusNode) {
      if (selectionIsEmpty(selection)) {
        console.log("selection is empty", { selection });
        return;
      }

      if (
        selection.anchorNode.parentElement?.closest("span.labelName") ||
        selection.focusNode.parentElement?.closest("span.labelName")
      ) {
        console.log("selection starts or ends in span.labelName");
        return;
      }

      const startBaseElement = selection.anchorNode.parentElement;
      const startBaseParentElement = startBaseElement?.closest(
        "span[data-start],mark[data-start]"
      );
      const startBase = startBaseParentElement?.getAttribute("data-start");

      const endBaseElement = selection.focusNode.parentElement;
      const endBaseParentElement = endBaseElement?.closest(
        "span[data-start],mark[data-start]"
      );
      const endBase = endBaseParentElement?.getAttribute("data-start");
      if (startBase == null || endBase == null) {
        console.log("base null");
        return;
      }

      let start =
        parseInt(String(startBase), 10) +
        selection.anchorOffset +
        getOffset(startBaseElement!, startBaseParentElement!);
      let end =
        parseInt(String(endBase), 10) +
        selection.focusOffset +
        getOffset(endBaseElement!, endBaseParentElement!);

      if (selectionIsBackwards(selection)) {
        [start, end] = [end, start];
      }

      const indexedInfo = getIndexedLabelUnitInfo(text, props.labelUnits);
      for (let i = start; i < end; i++) {
        indexedInfo[i].labelNames.add(props.labelName);
      }
      const newLabelUnits = getLabelUnitsFromIndexedInfo(text, indexedInfo);

      props.updateLabelUnits(newLabelUnits);
    }
  };

  const handleChunkClick = (start: number, end: number) => {
    // delete a label / labels on a clicked chunk
    const selection = window.getSelection();

    let focusOffset = 0;
    let anchorOffset = 0;
    if (selection) {
      focusOffset = selection.focusOffset;
      anchorOffset = selection.anchorOffset;
    }

    // return if a range is selected
    if (focusOffset - anchorOffset !== 0) {
      return;
    }

    const newLabelUnits = props.labelUnits.filter((labelUnit) => {
      if (labelUnit.start <= start && end <= labelUnit.end) {
        return false;
      } else {
        return true;
      }
    });
    props.updateLabelUnits(newLabelUnits);
  };

  const { text, labelUnits } = props;

  const chunks = getChunks(text, labelUnits);

  return (
    <span onMouseUp={handleMouseUp}>
      {chunks.map((chunk) => (
        <Chunk
          key={`${chunk.start}-${chunk.end}`}
          {...chunk}
          onClick={handleChunkClick}
          getBackgroungColor={props.getBackgroungColor}
          textElementGenerator={props.textElementGenerator}
        />
      ))}
    </span>
  );
};

export default TextAnnotateMulti;

// count characters between node and parentNode
const getOffset = (node: Node, parentNode: Node): number => {
  if (node === parentNode) {
    return 0;
  }

  if (node.previousSibling) {
    const prevLen = node.previousSibling.textContent
      ? node.previousSibling.textContent.length
      : 0;
    return prevLen + getOffset(node.previousSibling, parentNode);
  }

  if (node.parentNode === parentNode) {
    return 0;
  }

  if (!node.parentNode) {
    console.log("parentNode not found.");
    return 0;
  }
  return getOffset(node.parentNode, parentNode);
};

const getIndexedLabelUnitInfo = (text: string, labelUnits: LabelUnit[]) => {
  const indexedInfo = Array(text.length)
    .fill(0)
    .map(() => {
      return { labelNames: new Set<string>() };
    });

  labelUnits.forEach((labelUnit: LabelUnit) => {
    for (let i = labelUnit.start; i < labelUnit.end; i++) {
      indexedInfo[i].labelNames.add(labelUnit.labelName);
    }
  });
  return indexedInfo;
};

const getLabelUnitsFromIndexedInfo = (
  text: string,
  indexedLabelUnitInfo: {
    labelNames: Set<string>;
  }[]
) => {
  const newValue = Array.from(
    new Set(
      indexedLabelUnitInfo
        .map((info) => {
          return Array.from(info.labelNames);
        })
        .flat()
    )
  )
    .map((labelName) => {
      return Object.entries(indexedLabelUnitInfo)
        .filter(([, info]) => {
          return info.labelNames.has(labelName);
        })
        .reduce((prev: LabelUnit[], [index], i) => {
          if (i === 0) {
            const val = {
              start: Number(index),
              end: Number(index) + 1,
              labelName: labelName,
              text: text.slice(Number(index), Number(index) + 1),
            };
            return [val];
          }
          const prevVal = prev[prev.length - 1];
          if (prevVal.end === Number(index)) {
            prevVal.end++;
            prevVal.text = text.slice(prevVal.start, prevVal.end);
            return prev;
          } else {
            const val = {
              start: Number(index),
              end: Number(index) + 1,
              labelName: labelName,
              text: text.slice(Number(index), Number(index) + 1),
            };
            prev.push(val);
            return prev;
          }
        }, []);
    })
    .flat();

  return newValue;
};

const getChunks = (text: string, labelunits: LabelUnit[]) => {
  const indexedInfo = getIndexedLabelUnitInfo(text, labelunits);

  const chunks = indexedInfo.reduce((prev: ChunkUnit[], cur, i) => {
    if (i === 0) {
      const chunk = {
        start: 0,
        end: 1,
        labelNames: cur.labelNames,
        text: text.slice(0, 1),
        mark: cur.labelNames.size > 0,
      };
      return [chunk];
    }
    const prevInfo = indexedInfo[i - 1];
    if (setsAreEqual(prevInfo.labelNames, cur.labelNames)) {
      const lastChunk = prev[prev.length - 1];
      lastChunk.end++;
      lastChunk.text = text.slice(lastChunk.start, lastChunk.end);
      return prev;
    } else {
      const chunk = {
        start: i,
        end: i + 1,
        labelNames: cur.labelNames,
        text: text.slice(i, i + 1),
        mark: cur.labelNames.size > 0,
      };
      prev.push(chunk);
      return prev;
    }
  }, []);
  return chunks;
};

const setsAreEqual = (a: Set<any>, b: Set<any>) => {
  if (a.size !== b.size) {
    return false;
  }

  return Array.from(a).every((element) => {
    return b.has(element);
  });
};

const selectionIsEmpty = (selection: Selection) => {
  const position = selection.anchorNode!.compareDocumentPosition(
    selection.focusNode!
  );

  return position === 0 && selection.focusOffset === selection.anchorOffset;
};

const selectionIsBackwards = (selection: Selection) => {
  if (selectionIsEmpty(selection)) return false;

  const position = selection.anchorNode!.compareDocumentPosition(
    selection.focusNode!
  );
  let backward = false;
  if (
    (!position && selection.anchorOffset > selection.focusOffset) ||
    position === Node.DOCUMENT_POSITION_PRECEDING
  )
    backward = true;

  return backward;
};
