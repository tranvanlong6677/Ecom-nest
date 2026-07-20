import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { CANCEL_PAYMENT_JOB_NAME, DELAY_PAYMENT_JOB_TIME, PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constants'
import { generateCancelPaymentID } from '@/shared/helper'

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {
    void this.paymentQueue.getJobs().then((jobs) => {
      if (jobs.length === 0) {
        console.log('No jobs in the queue')
        return
      }

      console.log('Jobs in the queue:')

      jobs.forEach((job) => {
        if (job.name === CANCEL_PAYMENT_JOB_NAME) {
          console.log(job.name + ': ' + job.opts.jobId)
        }
      })
    })
  }

  async addCancelPaymentJob(paymentId: number): Promise<void> {
    await this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      { paymentId },
      {
        delay: DELAY_PAYMENT_JOB_TIME,
        jobId: generateCancelPaymentID(paymentId),
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }
}
