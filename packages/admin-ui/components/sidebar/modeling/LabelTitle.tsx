interface LabelTitleProps {
  title: string;
}

export default function LabelTitle({ title, ...restProps }: LabelTitleProps) {
  return (
    <span className="adm-treeTitle__title" title={title} {...restProps}>
      {title}
    </span>
  );
}
