declare type NewLine = '\n';
declare const NewLine: '\n';
declare enum ListType {
  Ordered = 'ordered',
  Bullet = 'bullet',
  Checked = 'checked',
  Unchecked = 'unchecked',
}
declare enum ScriptType {
  Sub = 'sub',
  Super = 'super',
}
declare enum DirectionType {
  Rtl = 'rtl',
}
declare enum AlignType {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Justify = 'justify',
}
declare enum DataType {
  Image = 'image',
  Video = 'video',
  Formula = 'formula',
  Text = 'text',
}
declare enum GroupType {
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
