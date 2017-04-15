
type EmbedType = "image" | "video" | "formula";
const EmbedType = {
    Image: "image" as EmbedType,
    Video: "video" as EmbedType,
    Formula: "formula" as EmbedType
};

class Embed {
    readonly type: EmbedType;
    readonly value: string;
    constructor(type: EmbedType, value: string) {
        this.type = type;
        this.value = value;
    }
};

export { Embed, EmbedType };
