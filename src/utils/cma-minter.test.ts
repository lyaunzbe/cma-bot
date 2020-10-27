import CMAMinter from './cma-minter'

describe('CMA Minter class', () => {
  test('provider returns a list of accounts', async () => {
    const minter = new CMAMinter()
    const accounts = await minter.providerListAccounts()
    expect(accounts.length).toBeGreaterThan(0)
  })

  test('contract can mint token', async () => {
    const minter = new CMAMinter()
    const mintedToken = await minter.mint(1)
    console.log(mintedToken)
    expect('').toBe('')
  })

  test('contract can return the balance of a token for an account', async () => {
    const minter = new CMAMinter()
    const balance = await minter.balanceOf(4)
    console.log(balance)
    expect('').toBe('')
  })

})