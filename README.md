# React Text Annotate Multi <!-- omit in toc -->

This library provides a React component for labeling a selected range of text. Arbitrary number of labels can be overlapped.

This project stems from [react-text-annotate-blend](<https://www.npmjs.com/package/react-text-annotate-blend>), in which only two overlapping labels are allowed.

- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
- [Props](#props)

## Installation

```
npm install @badiary/react-text-annotate-multi
```

## Demo

[demo website](https://badiary.github.io/react-text-annotate-multi-doc/)

## Usage

```tsx
type LabelUnit = {
  start: number;
  end: number;
  labelName: string;
  text: string;
};

const initialLabelUnits: LabelUnit[] = [
  {
    start: 51,
    end: 64,
    labelName: "labelB",
    text: "Design simple",
  },
  {
    start: 111,
    end: 116,
    labelName: "labelB",
    text: "React",
  },
  {
    start: 111,
    end: 151,
    labelName: "labelC",
    text: "React will efficiently update and render",
  },
];

const demoText =
  "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes. Declarative views make your code more predictable and easier to debug.";

const COLORS: { [key: string]: string } = {
  labelA: "rgb(179, 245, 66)",
  labelB: "#99ffff",
  labelC: "#ff99ff",
};

const getBackgroungColor = (labelNames: Set<string>): string => {
  const muitiLabeledColor = "#c8c8c8";
  let bgColor = muitiLabeledColor;

  if (labelNames.size === 1) {
    let labelName = Array.from(labelNames)[0];
    if (labelName in COLORS) {
      bgColor = COLORS[labelName];
    }
  }

  return bgColor;
};

function App() {
  const [labelUnits, setLabelUnits] = useState(initialLabelUnits);
  const [labelName, setLabelName] = useState("labelA");

  return (
    <>
      <select onChange={(e) => setLabelName(e.target.value)}>
        {Object.keys(COLORS).map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      <div>
        <TextAnnotateMulti
          text={demoText}
          updateLabelUnits={(newLabelUnits:LabelUnit[]) => {
            setLabelUnits(newLabelUnits);
          }}
          labelUnits={labelUnits}
          labelName={labelName}
          getBackgroungColor={getBackgroungColor}
        />
      </div>

      <h3>Current Stored Label</h3>
      <div>
        <pre>{JSON.stringify(labelUnits, null, 2)}</pre>
      </div>
    </>
  );
}
```

## Props

|  Property  |  Type  |  Description  |
| ---- | ---- | ---- |
|  text  |  string  | Text you want to annotate. |
|  labelName  |  string  | Name of a label you want to annotate. This may be a state of a React component which refers to a value of select tag. |
|  labelUnits  |  LabelUnit[]  | An array of `LabelUnit`(*) which corresponds to label data. This may be a state of a React component which stores label data. |
|  updateLabelUnits  | (newLabelUnits: LabelUnit[]) => void  |  Fired when label data is updated. Call `React.SetStateAction` in this function to update the state of labelUnits.  |
|  getBackgroungColor  |  (labelNames: Set&lt;string&gt;) => string  | A function which returns a background color of labeled name set. Returned string must be interpretable as a backgroundColor property of CSS. (e.g. "#42f5f5", "rgb(179, 245, 66)", etc...) |
|  textElementGenerator<br>(optional)  |  (text: string) => string &#124; JSX.Element &#124; JSX.Element[]  | A function which generates a text node / element(s). Useful when you want to modify labeled text (e.g. highlighting keywords).  |

(*) Type `LabelUnit` is defined as follows:

```javascript
type LabelUnit = {
  start: number;     // index at which labeled text starts
  end: number;       // index at which labeled text ends
  labelName: string; // labeled name
  text: string;      // text of labeled range
};
```
