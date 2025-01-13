# nextjs-show-dialog-hook

## The hook is a hook that makes it easy to open the dialog.

- react 에서 작동
- props 로 open, onClose 를 받는 dialog UI Component를 showDialog method 에 전달하면,
  자동으로 open, close state 를 제어해줌.
- const { showDialog } = useDialog();
- showDialog: (dialogComponent, props)
- dialogComponent: React.ReactNode
- props: open, onClose 를 제외한 나머지 props
