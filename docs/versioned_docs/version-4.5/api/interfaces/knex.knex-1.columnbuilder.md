---
id: "knex.knex-1.columnbuilder"
title: "Interface: ColumnBuilder"
sidebar_label: "ColumnBuilder"
custom_edit_url: null
hide_title: true
---

# Interface: ColumnBuilder

[knex](../modules/knex.md).[Knex](../modules/knex.knex-1.md).ColumnBuilder

## Hierarchy

* **ColumnBuilder**

  ↳ [*PostgreSqlColumnBuilder*](knex.knex-1.postgresqlcolumnbuilder.md)

  ↳ [*ReferencingColumnBuilder*](knex.knex-1.referencingcolumnbuilder.md)

  ↳ [*AlterColumnBuilder*](knex.knex-1.altercolumnbuilder.md)

## Methods

### after

▸ **after**(`columnName`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`columnName` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1817

___

### alter

▸ **alter**(): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1814

___

### comment

▸ **comment**(`value`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1813

___

### defaultTo

▸ **defaultTo**(`value`: [*Value*](../modules/knex.knex-1.md#value)): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`value` | [*Value*](../modules/knex.knex-1.md#value) |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1809

___

### first

▸ **first**(): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1818

___

### index

▸ **index**(`indexName?`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`indexName?` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1803

___

### notNullable

▸ **notNullable**(): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1811

___

### nullable

▸ **nullable**(): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1812

___

### onDelete

▸ **onDelete**(`command`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1807

___

### onUpdate

▸ **onUpdate**(`command`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1808

___

### primary

▸ **primary**(`constraintName?`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`constraintName?` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1804

___

### queryContext

▸ **queryContext**(`context`: *any*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`context` | *any* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1815

___

### references

▸ **references**(`columnName`: *string*): [*ReferencingColumnBuilder*](knex.knex-1.referencingcolumnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`columnName` | *string* |

**Returns:** [*ReferencingColumnBuilder*](knex.knex-1.referencingcolumnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1806

___

### unique

▸ **unique**(`indexName?`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`indexName?` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1805

___

### unsigned

▸ **unsigned**(): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1810

___

### withKeyName

▸ **withKeyName**(`keyName`: *string*): [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

#### Parameters:

Name | Type |
:------ | :------ |
`keyName` | *string* |

**Returns:** [*ColumnBuilder*](knex.knex-1.columnbuilder.md)

Defined in: node_modules/knex/types/index.d.ts:1816
