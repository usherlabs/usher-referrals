import {expect, test} from '@oclif/test'

describe('arcampaigns', () => {
  test
  .stdout()
  .command(['arcampaigns'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['arcampaigns', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
