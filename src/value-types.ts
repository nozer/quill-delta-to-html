
type NewLine = "\n";
const NewLine = "\n" as NewLine;

type ListType = "ordered" | "bullet";
const ListType = {
    Ordered: 'ordered' as ListType,
    Bullet: 'bullet' as ListType
}

type ScriptType = "sub" | "super";
const ScriptType = {
    Sub: "sub" as ScriptType,
    Super: "super" as ScriptType
}

type DirectionType = "rtl";
const DirectionType = {
    Rtl: "rtl" as DirectionType
}

type AlignType = "center" | "right";
const AlignType = {
    Center: "center" as AlignType,
    Right: "right" as AlignType
}

type DataType = "text" | "image" | "video" | "formula";
const DataType = {
    Image: "image" as DataType,
    Video: "video" as DataType,
    Formula: "formula" as DataType,
    Text: "text" as DataType
};

type GroupType = "block" | "inline-group" | "list" | "video";
const GroupType = {
    Block: 'block' as GroupType,
    InlineGroup: 'inline-group' as GroupType,
    List: 'list' as GroupType,
    Video: 'video' as GroupType
};

export { NewLine, ListType, ScriptType, DirectionType, AlignType, DataType, GroupType };
