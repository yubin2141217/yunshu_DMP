import type { FormInstance } from '@arco-design/web-vue'

/** 触发表单校验；通过返回 true，失败时字段会标红并返回 false */
export async function validateForm(
  formRef?: FormInstance | null,
  fields?: string[],
): Promise<boolean> {
  if (!formRef) return true
  const errors = fields?.length ? await formRef.validateField(fields) : await formRef.validate()
  return !errors
}

export function clearFormValidate(formRef?: FormInstance | null) {
  formRef?.clearValidate()
}
