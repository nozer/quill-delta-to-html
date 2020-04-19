type NewLine = '\n';
const NewLine = '\n' as NewLine;

enum ListType {
  Ordered = 'ordered',
  Bullet = 'bullet',
  Checked = 'checked',
  Unchecked = 'unchecked',
}

enum ScriptType {
  Sub = 'sub',
  Super = 'super',
}

enum DirectionType {
  Rtl = 'rtl',
}

enum AlignType {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Justify = 'justify',
}

enum DataType {
  Image = 'image',
  Video = 'video',
  Formula = 'formula',
  Text = 'text',
}

enum GroupType {
  Block = 'block',
  InlineGroup = 'inline-group',
  List = 'list',
  Video = 'video',
  Table = 'table',
}

export {
  NewLine,
  ListType,
  ScriptType,
  DirectionType,
  AlignType,
  DataType,
  GroupType,
};
